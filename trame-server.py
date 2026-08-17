import concurrent.futures
import time
import asyncio

from vtkmodules.vtkRenderingCore import (
    vtkRenderWindow,
    vtkRenderer,
    vtkRenderWindowInteractor,
    vtkPolyDataMapper,
    vtkActor,
)
from vtkmodules.vtkFiltersSources import vtkConeSource
from vtkmodules.vtkInteractionStyle import vtkInteractorStyleSwitch  # noqa
import vtkmodules.vtkRenderingOpenGL2  # noqa

from trame.app import get_server
from trame.widgets import vtk
from trame.decorators import TrameApp, change, trigger

##################################################################################
import os
from pathlib import Path
from vtkmodules.util.numpy_support import numpy_to_vtk
from vtkmodules.vtkCommonDataModel import vtkImageData
from vtkmodules.vtkCommonDataModel import vtkPiecewiseFunction
from vtkmodules.vtkRenderingVolumeOpenGL2 import vtkSmartVolumeMapper
from vtkmodules.vtkRenderingCore import (
    vtkColorTransferFunction,
    vtkVolume,
    vtkVolumeProperty,
)

from read_dicom import read_dicom_study
from orientation_marker import OrientationMarker
from orientation_marker_triggers import OrientationMarkerTriggersMixin
##################################################################################

DICOM_DIR = str(Path('./data/ct1'))

@TrameApp()
class WebApp(OrientationMarkerTriggersMixin):

    def __init__(self):
        # client type does not matter since we are just using the server
        self.server = get_server()
        self.current_event_loop = asyncio.get_event_loop()

        # Thread pool
        self.pool = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    
        # State variables for Orientation marker
        self.server.state.orientation_marker_type = 11
        self.server.state.orientation_marker_visible = True
        self.server.state.orientation_marker_size = 20

        # Custom VTK code
        self.setup_vtk()

        self.orientation_marker = OrientationMarker(
            render_window_interactor=self.render_window_interactor,
            marker_models_dir=self.server.state.marker_models_dir,
        )
        self.orientation_marker.set_marker(
            OrientationMarker.TYPE_AXES
        )

        # Create server side for remote view
        self.client_view = vtk.VtkRemoteView(
            self.render_window, trame_server=self.server, ref="view"
        )


    def create_vtk_volume_from_dicom(self, image, volume_array, study_info):
        """
        Create VTK volume from DICOM data.
        
        Args:
            image: ITK image object
            volume_array: numpy array of the volume
            study_info: dictionary with study metadata
            
        Returns:
            vtkVolume: ready to be added to a renderer
        """
        cols, rows, num_slices = study_info['dimensions']
        spacing = study_info['spacing']
        lo, hi = study_info['range']
        
        # Convert to VTK format
        vtk_data = numpy_to_vtk(volume_array.ravel(), deep=True)
        image_data = vtkImageData()
        image_data.SetDimensions(cols, rows, num_slices)
        image_data.SetSpacing(spacing[0], spacing[1], spacing[2])
        image_data.GetPointData().SetScalars(vtk_data)
        
        # Basic transfer functions
        color_tf = vtkColorTransferFunction()
        color_tf.AddRGBPoint(lo, 0.0, 0.0, 0.0)      # Black for low
        color_tf.AddRGBPoint(hi, 1.0, 1.0, 1.0)      # White for high
        
        opacity_tf = vtkPiecewiseFunction()
        opacity_tf.AddPoint(lo, 0.0)                 # Transparent at low
        opacity_tf.AddPoint(hi, 1.0)                 # Opaque at high
        
        # Volume property
        volume_prop = vtkVolumeProperty()
        volume_prop.SetColor(color_tf)
        volume_prop.SetScalarOpacity(opacity_tf)
        volume_prop.SetInterpolationTypeToLinear()
        
        # Mapper
        mapper = vtkSmartVolumeMapper()
        mapper.SetInputData(image_data)
        mapper.SetBlendModeToComposite()
        
        # Volume
        volume = vtkVolume()
        volume.SetMapper(mapper)
        volume.SetProperty(volume_prop)
        
        return volume, image_data, mapper, volume_prop


    # Example usage in your setup_vtk:
    def setup_vtk(self):
        print("[Trame] setup_vtk()")
        
        try:
            # Setup renderer
            renderer = vtkRenderer()
            render_window = vtkRenderWindow()
            render_window.AddRenderer(renderer)
            render_window.OffScreenRenderingOn()
            
            # Read DICOM using the specialized function
            image, volume_array, study_info = read_dicom_study(DICOM_DIR)
            
            # Create VTK volume
            volume, image_data, mapper, volume_prop = self.create_vtk_volume_from_dicom(
                image, volume_array, study_info
            )
            
            # Add to renderer
            renderer.AddVolume(volume)
            renderer.SetBackground(0.1, 0.1, 0.1)
            renderer.ResetCamera()
            render_window.Render()
            
            # Store references
            self.image_data = image_data
            self.volume = volume
            self.mapper = mapper
            self.volume_prop = volume_prop
            self.renderer = renderer
            self.render_window = render_window
            self.study_info = study_info
            
            # Create interactor
            self.render_window_interactor = vtkRenderWindowInteractor()
            self.render_window_interactor.SetRenderWindow(render_window)
            self.render_window_interactor.GetInteractorStyle().SetCurrentStyleToTrackballCamera()
            
            print("[Trame] Setup complete!")
            
        except Exception as e:
            print(f"\n[Trame] ERROR in setup_vtk: {e}")
            import traceback
            traceback.print_exc()
            raise



    ###############################################################################
    #######################ORiENTATION#MARKERS#####################################
    ###############################################################################
    def _update_orientation_marker_viewport(self):
        """Update marker viewport based on orientation_marker_size."""
        widget = self.orientation_marker_widget

        if widget is None: return

        size = int(self.orientation_marker_size)

        size = max(0, min(100, size))

        if size == 0:
            widget.SetEnabled(False)
            return

        normalized_size = size / 100.0

        widget.SetViewport( 0.0, 0.0, normalized_size,normalized_size,)

        visible = bool(self.orientation_marker_visible)
        widget.SetEnabled(visible)


    def create_orientation_marker(self, model_path=None):
        """
        Create the VTK prop used by vtkOrientationMarkerWidget.
        If model_path is None, a vtkAxesActor is returned.

        Returns
        -------
        vtkProp or None
            Actor/axes actor to use as the orientation marker.
        """
        if model_path is None:
            if self.orientation_axes is None:
                self.orientation_axes = vtkAxesActor()

                self.orientation_axes.SetShaftTypeToCylinder()
                self.orientation_axes.SetCylinderRadius(0.02)
                self.orientation_axes.SetConeRadius(0.04)
                self.orientation_axes.SetSphereRadius(0.04)

            return self.orientation_axes


        if not os.path.isfile(model_path):
            print(f"Orientation marker model does not exist: {model_path}")
            return None

        extension = os.path.splitext(model_path)[1].lower()

        if extension == ".stl":
            reader = vtkSTLReader()
        elif extension == ".obj":
            reader = vtkOBJReader()
        else:
            print(f"Unsupported orientation marker format: {extension}")
            return None

        reader.SetFileName(model_path)
        reader.Update()

        # Check whether the reader actually produced geometry
        output = reader.GetOutput()

        if output is None or output.GetNumberOfPoints() == 0:
            print(f"Orientation marker model contains no geometry: {model_path}")
            # Release the reader immediately.
            reader = None
            return None


        mapper = vtkPolyDataMapper()
        mapper.SetInputConnection(reader.GetOutputPort())

        actor = vtkActor()
        actor.SetMapper(mapper)

        self.orientation_marker_reader = reader
        self.orientation_marker_mapper = mapper
        self.orientation_marker_actor = actor

        return actor


    def create_orientation_marker_widget(self, model_path=None):
        """
        Create and configure vtkOrientationMarkerWidget.

        The widget itself owns/uses the supplied orientation marker.
        """

        marker_prop = self.create_orientation_marker(model_path)

        if marker_prop is None:
            return None

        widget = vtkOrientationMarkerWidget()

        widget.SetOrientationMarker(marker_prop)
        widget.SetInteractor(self.render_window_interactor)

        widget.SetViewport(
            0.0,
            0.0,
            0.20,
            0.20,
        )

        widget.InteractiveOff()
        widget.SetEnabled(True)
        return widget


    def destroy_orientation_marker(self):
        """
        Properly destroy the current orientation marker.

        This is called whenever the marker is replaced or disabled.
        """

        widget = self.orientation_marker_widget
        if widget is not None:
            widget.SetEnabled(False)
            widget.SetOrientationMarker(None)
            widget.SetInteractor(None)
            self.orientation_marker_widget = None

        actor = self.orientation_marker_actor

        if actor is not None:
            actor.SetMapper(None)

        self.orientation_marker_actor = None
        self.orientation_marker_mapper = None
        self.orientation_marker_reader = None

    def update_orientation_marker(self, marker_type):
        """
        Change the orientation marker.

        marker_type == 0:
            Disable marker.

        marker_type > 0:
            Load corresponding anatomical model.
        """

        self.destroy_orientation_marker()

        if marker_type == 0:
            self.render_window.Render()
            self.client_view.update()
            return

        marker_dir = self.server.state.marker_models_dir

        model_files = {
            1: os.path.join(marker_dir, "cat.obj"),
            2: os.path.join(marker_dir, "brain.stl"),
            3: os.path.join(marker_dir, "skull.stl"),
            4: os.path.join(marker_dir, "spine.stl"),
            5: os.path.join(marker_dir, "heart.stl"),
            6: os.path.join(marker_dir, "lungs.stl"),
            7: os.path.join(marker_dir, "liver.stl"),
            8: os.path.join(marker_dir, "kidney.stl"),
            9: os.path.join(marker_dir, "stomach.stl"),
            10: os.path.join(marker_dir, "default.stl"),
        }

        model_path = model_files.get(marker_type)

        if model_path is None:
            logger.warning(
                "Unknown orientation marker type: %s",
                marker_type,
            )

            self.render_window.Render()
            self.client_view.update()
            return

        widget = self.create_orientation_marker_widget(model_path)

        if widget is None:
            print(f"Failed to create orientation marker: {model_path}")

            self.render_window.Render()
            self.client_view.update()
            return

        self.orientation_marker_widget = widget

        self.render_window.Render()
        self.client_view.update()


    @trigger("set_orientation_marker")
    def set_orientation_marker( self, marker_type=0, ):
        marker_type = int(marker_type)
        self.server.state.orientation_marker_type = marker_type
        self.update_orientation_marker(marker_type)

    @trigger("toggle_orientation_marker")
    def toggle_orientation_marker(self):
        current = bool(
            self.orientation_marker_visible
        )

        self.orientation_marker_visible = not current
    
    @trigger("set_orientation_marker_size")
    def set_orientation_marker_size(self, size=20):
        size = int(size)
        size = max(0, min(100, size))

        self.server.state.orientation_marker_size = size

        self._update_orientation_marker_viewport()

        self.render_window.Render()
        self.client_view.update()


    ###############################################################################
    #################################OTHER#########################################
    ###############################################################################


    @trigger("set_background_color")
    def set_background_color(self, color="#1a1a1a"):
        """Set renderer background color from hex value"""
        # Convert hex to RGB (0-1 range)
        hex_color = color.lstrip('#')
        r = int(hex_color[0:2], 16) / 255.0
        g = int(hex_color[2:4], 16) / 255.0
        b = int(hex_color[4:6], 16) / 255.0
        
        self.renderer.SetBackground(r, g, b)
        self.render_window.Render()
        self.client_view.update()

    @trigger("reset_camera")
    def reset_camera(self):
        self.renderer.ResetCamera()
        self.client_view.update()

    def exec_js(self, *args):
        self.server.js_call("ref:hello", "method:world", *args)


if __name__ == "__main__":
    web_app = WebApp()
    web_app.server.start()
