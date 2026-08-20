from trame.decorators import change, trigger


class CinematicRenderingTriggersMixin:
    """
    Trame/React interface for CinematicRendering.
    """


    def setup_cinematic_rendering_state(self):
        """
        Initialize Trame state.
        """
        cinematic = self.cinematic
        self.server.state.cinematic_rendering_enabled = cinematic.enabled

        self.server.state.cinematic_quality = "medium"
        self.server.state.cinematic_scattering = cinematic.scattering
        self.server.state.lighting_ambient = cinematic.ambient
        self.server.state.lighting_diffuse = cinematic.diffuse
        self.server.state.lighting_specular = cinematic.specular
        self.server.state.lighting_specular_power = cinematic.specular_power
        self.server.state.brightness = cinematic.brightness
        self.server.state.contrast = cinematic.contrast
        self.server.state.window_width = cinematic.window_width
        self.server.state.window_level = cinematic.window_level

    @trigger("set_brightness")
    def set_brightness(self, value):
        value = float(value)
        self.cinematic.set_brightness(value)
        self.server.state.brightness = value

    @trigger("set_contrast")
    def set_contrast(self, value):
        value = float(value)
        self.cinematic.set_contrast(value)
        self.server.state.contrast = value

    @trigger("set_window_width")
    def set_window_width(self, value):
        value = float(value)
        self.cinematic.set_window_width(value)
        self.server.state.window_width = value


    @trigger("set_window_level")
    def set_window_level(self, value):
        value = float(value)
        self.cinematic.set_window_level(value)
        self.server.state.window_level = value

    @trigger("set_lighting_ambient")
    def set_lighting_ambient(self, value):
        value = float(value)
        self.cinematic.set_ambient(value)
        self.server.state.lighting_ambient = value

    @trigger("set_lighting_diffuse")
    def set_lighting_diffuse(self, value):
        value = float(value)
        self.cinematic.set_diffuse(value)
        self.server.state.lighting_diffuse = value

    @trigger("set_lighting_specular")
    def set_lighting_specular(self, value):
        value = float(value)
        self.cinematic.set_specular(value)
        self.server.state.lighting_specular = value

    @trigger("set_lighting_specular_power")
    def set_lighting_specular_power(self, value):
        value = float(value)
        self.cinematic.set_specular_power(value)
        self.server.state.lighting_specular_power = value

    @trigger("cinematic_rendering_toggle")
    def cinematic_rendering_toggle(self, enabled):
        enabled = bool(enabled)
        self.cinematic.toggle(enabled)
        self.server.state.cinematic_rendering_enabled = self.cinematic.enabled
        
    @trigger("set_cinematic_quality")
    def set_cinematic_quality(self, quality):
        """
        low, medium, high, ultra
        """
        self.cinematic.set_quality(quality)
        self.server.state.cinematic_quality = quality

    @trigger("set_cinematic_scattering")
    def set_cinematic_scattering(self, value):
        value = float(value)
        self.cinematic.set_scattering(value)
        self.server.state.cinematic_scattering = value


    @trigger("set_transfer_function")
    def set_transfer_function(self, data):
        """
        {
            preset: "some-preset",
            intensities: [...],
            opacities: [...],
            colors: [...]
        }
        """

        if not isinstance(data, dict):
            raise ValueError("[Cinematic Rendering]set_transfer_function expects an object.")

        preset = data.get("preset")
        intensities = data.get("intensities", [])
        opacities = data.get("opacities", [])
        colors = data.get("colors", [])

        self.cinematic.set_transfer_function(intensities=intensities,opacities=opacities,colors=colors,preset=preset)
        self.server.state.transfer_function_preset = preset