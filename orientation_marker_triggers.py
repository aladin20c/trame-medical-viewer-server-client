# orientation_marker_triggers.py

from trame.decorators import trigger


class OrientationMarkerTriggersMixin:

    @trigger("set_orientation_marker")
    def set_orientation_marker(self, marker_type):
        marker_type = marker_type

        self.server.state.orientation_marker_type = marker_type

        self.orientation_marker.set_marker(marker_type)

        self.render_window.Render()
        self.client_view.update()

    @trigger("toggle_orientation_marker")
    def toggle_orientation_marker(self):
        self.orientation_marker.toggle_visible()

        self.server.state.orientation_marker_visible = (
            self.orientation_marker.visible
        )

        self.render_window.Render()
        self.client_view.update()

    @trigger("set_orientation_marker_visibility")
    def set_orientation_marker_visibility(self, visible=True):
        visible = bool(visible)

        self.server.state.orientation_marker_visible = visible

        self.orientation_marker.set_visible(visible)

        self.render_window.Render()
        self.client_view.update()

    @trigger("set_orientation_marker_size")
    def set_orientation_marker_size(self, size=20):
        size = max(0, min(100, int(size)))

        self.server.state.orientation_marker_size = size

        self.orientation_marker.set_size(size)

        self.render_window.Render()
        self.client_view.update()