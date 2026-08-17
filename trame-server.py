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
