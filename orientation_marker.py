# orientation_marker.py

import os
import logging

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


logger = logging.getLogger(__name__)


class OrientationMarker:
    """
    Handles the VTK orientation marker and its lifecycle.
    """

    MODEL_FILES = {
        "cat": "cat.obj",
        "brain": "brain.stl",
        "skull": "skull.stl",
        "spine": "spine.stl",
        "heart": "heart.stl",
        "lungs": "lungs.stl",
        "liver": "liver.stl",
        "kidney": "kidney.stl",
        "stomach": "stomach.stl",
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
            self.axes.SetShaftTypeToCylinder()
            self.axes.SetCylinderRadius(0.02)
            self.axes.SetConeRadius(0.04)
            self.axes.SetSphereRadius(0.04)
        return self.axes

    def _create_cube(self):
        if self.cube is None:
            self.cube = vtkAnnotatedCubeActor()
            self.cube.SetXPlusFaceText("L")
            self.cube.SetXMinusFaceText("R")
            self.cube.SetYPlusFaceText("P")
            self.cube.SetYMinusFaceText("A")
            self.cube.SetZPlusFaceText("S")
            self.cube.SetZMinusFaceText("I")
            self.cube.SetFaceTextScale(0.65)
            self.cube.GetTextEdgesProperty().SetLineWidth(2)
            self.cube.GetCubeProperty().SetOpacity(1.0)
        return self.cube

    def _load_model(self, model_path):
        if not os.path.isfile(model_path):
            logger.warning( "Orientation marker model does not exist: %s", model_path)
            return None

        extension = os.path.splitext(model_path)[1].lower()

        if extension == ".stl":
            reader = vtkSTLReader()
        elif extension == ".obj":
            reader = vtkOBJReader()
        else:
            logger.warning( "Unsupported orientation marker format: %s", extension)
            return None

        reader.SetFileName(model_path)
        reader.Update()

        output = reader.GetOutput()

        if output is None or output.GetNumberOfPoints() == 0:
            logger.warning("Orientation marker model contains no geometry: %s",model_path)
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
            logger.warning("Unknown orientation marker type: %s",marker_type,)
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

        self.widget.SetViewport(
            0.0,
            0.0,
            normalized_size,
            normalized_size,
        )

        self.widget.SetEnabled(bool(self.visible))

    def set_marker(self, marker_type):
        self.destroy()

        marker_type = marker_type

        marker = self._create_marker(marker_type)

        if marker is None:
            return

        self.widget = vtkOrientationMarkerWidget()

        self.widget.SetOrientationMarker(marker)
        self.widget.SetInteractor(self.interactor)

        self.widget.InteractiveOff()

        self._apply_viewport()


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