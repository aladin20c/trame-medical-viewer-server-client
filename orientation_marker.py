# orientation_marker.py

import os

from vtkmodules.vtkInteractionWidgets import vtkOrientationMarkerWidget
from vtkmodules.vtkRenderingCore import (
    vtkActor,
    vtkPolyDataMapper,
)
from vtkmodules.vtkRenderingAnnotation import (
    vtkAxesActor,
    vtkAnnotatedCubeActor,
)
from vtkmodules.vtkIOGeometry import (
    vtkOBJReader,
    vtkSTLReader,
)

class OrientationMarker:
    """
    Handles the VTK orientation marker and its lifecycle.
    """

    MODEL_FILES = {
        "human": "human.stl",
        "brain": "brain.stl",
        "heart": "heart.stl",
        "skull": "skull.stl",
        "lungs": "lungs.stl",
        "liver": "liver.stl",
        "kidneys": "kidney.stl",
    }
    TYPE_CUBE = "cube"
    TYPE_AXES = "axes"

    def __init__( self, render_window_interactor, marker_models_dir):
        self.interactor = render_window_interactor
        self.marker_models_dir = marker_models_dir

        self.widget = None
        # Current model pipeline
        self.actor = None
        self.mapper = None
        self.reader = None
        # Reusable built-in markers
        self.axes = None
        self.cube = None

        self.visible = True
        self.size = 20

    def _create_axes(self):
        if self.axes is None:
            self.axes = vtkAxesActor()
            # Geometry
            self.axes.SetShaftTypeToCylinder()
            self.axes.SetCylinderRadius(0.025)
            self.axes.SetConeRadius(0.055)
            self.axes.SetSphereRadius(0.045)
            red = (1.0, 0.15, 0.15)
            green = (0.15, 0.85, 0.25)
            blue = (0.15, 0.40, 1.0)
            # X axis
            self.axes.GetXAxisShaftProperty().SetColor(*red)
            self.axes.GetXAxisTipProperty().SetColor(*red)
            # Y axis
            self.axes.GetYAxisShaftProperty().SetColor(*green)
            self.axes.GetYAxisTipProperty().SetColor(*green)
            # Z axis
            self.axes.GetZAxisShaftProperty().SetColor(*blue)
            self.axes.GetZAxisTipProperty().SetColor(*blue)
            # labels
            self.axes.GetXAxisCaptionActor2D().GetCaptionTextProperty().SetColor(1.0, 1.0, 1.0)
            self.axes.GetYAxisCaptionActor2D().GetCaptionTextProperty().SetColor(1.0, 1.0, 1.0 )
            self.axes.GetZAxisCaptionActor2D().GetCaptionTextProperty().SetColor(1.0, 1.0, 1.0)

        return self.axes

    def _create_cube(self):
        if self.cube is None:
            self.cube = vtkAnnotatedCubeActor()
            # labels
            self.cube.SetXPlusFaceText("L")
            self.cube.SetXMinusFaceText("R")
            self.cube.SetYPlusFaceText("P")
            self.cube.SetYMinusFaceText("A")
            self.cube.SetZPlusFaceText("S")
            self.cube.SetZMinusFaceText("I")

            red = (0.85, 0.12, 0.12)
            green = (0.12, 0.65, 0.18)
            blue = (0.12, 0.32, 0.85)
            # X
            self.cube.GetXPlusFaceProperty().SetColor(*red)
            self.cube.GetXMinusFaceProperty().SetColor(*red)
            # Y
            self.cube.GetYPlusFaceProperty().SetColor(*green)
            self.cube.GetYMinusFaceProperty().SetColor(*green)
            # Z
            self.cube.GetZPlusFaceProperty().SetColor(*blue)
            self.cube.GetZMinusFaceProperty().SetColor(*blue)
            #  letters
            text_property = self.cube.GetTextEdgesProperty()
            text_property.SetColor(1.0, 1.0, 1.0)
            text_property.SetLineWidth(1.0)
            self.cube.SetFaceTextScale(0.65)
            # dark edges
            self.cube.GetTextEdgesProperty().SetColor(0.05, 0.05, 0.05)
            self.cube.GetTextEdgesProperty().SetLineWidth(1.5)
            self.cube.GetCubeProperty().SetOpacity(1.0)

        return self.cube

    def _load_model(self, model_path):
        if not os.path.isfile(model_path):
            print( f"[OrientationMarker]Orientation marker model does not exist: {model_path}")
            return None

        extension = os.path.splitext(model_path)[1].lower()

        if extension == ".stl":
            reader = vtkSTLReader()
        elif extension == ".obj":
            reader = vtkOBJReader()
        else:
            print( f"[OrientationMarker]Unsupported orientation marker format: {extension}")
            return None

        reader.SetFileName(model_path)
        reader.Update()

        output = reader.GetOutput()

        if output is None or output.GetNumberOfPoints() == 0:
            print( f"[OrientationMarker]Orientation marker model contains no geometry: {model_path}")
            return None

        mapper = vtkPolyDataMapper()
        mapper.SetInputConnection(reader.GetOutputPort())

        actor = vtkActor()
        actor.SetMapper(mapper)

        self.reader = reader
        self.mapper = mapper
        self.actor = actor

        return actor

    def _create_marker(self, marker_type):
        if marker_type == self.TYPE_AXES:
            return self._create_axes()
        if marker_type == self.TYPE_CUBE:
            return self._create_cube()

        filename = self.MODEL_FILES.get(marker_type)

        if filename is None:
            print( f"[OrientationMarker]Unknown orientation marker type: {marker_type}")
            return None

        path = os.path.join(self.marker_models_dir,filename)
        return self._load_model(path)

    def _apply_viewport(self):
        if self.widget is None:
            return
        size = max(0, min(100, int(self.size)))
        if size == 0:
            self.widget.SetEnabled(False)
            return
        normalized_size = size / 100.0
        self.widget.SetViewport( 0.0, 0.0, normalized_size, normalized_size,)
        self.widget.SetEnabled(bool(self.visible))

    def set_marker(self, marker_type):
        self.destroy()

        marker_type = marker_type
        marker = self._create_marker(marker_type)

        if marker is None: return

        self.widget = vtkOrientationMarkerWidget()
        self.widget.SetOrientationMarker(marker)
        self.widget.SetInteractor(self.interactor)
        self._apply_viewport()
        self.widget.InteractiveOff()

    def set_visible(self, visible):
        self.visible = bool(visible)
        self._apply_viewport()

    def toggle_visible(self):
        self.set_visible(not self.visible)

    def set_size(self, size):
        self.size = max(0, min(100, int(size)))
        self._apply_viewport()

    def destroy(self):
        if self.widget is not None:
            self.widget.SetEnabled(False)
            self.widget.SetOrientationMarker(None)
            self.widget.SetInteractor(None)
            self.widget = None

        if self.actor is not None:
            self.actor.SetMapper(None)

        self.actor = None
        self.mapper = None
        self.reader = None

    def dispose(self):
        self.destroy()
        self.axes = None
        self.cube = None