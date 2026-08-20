import vtk


class CinematicRendering:
    """
    - Cinematic rendering enable/disable
    - Cinematic quality
    - Cinematic scattering
    - Volume lighting/material
    - Brightness / contrast
    - Window width / window level
    - Transfer functions
    - Rendering presets supplied by the frontend
    - Light manipulation
    - Saving/restoring the pre-cinematic state
    """

    QUALITY_LEVELS = {
        "low": 1.0,
        "medium": 2.0,
        "high": 3.0,
        "ultra": 4.0,
    }

    def __init__( self, volume_property, renderer, render_window, mapper, image_data, color_transfer_function, opacity_transfer_function ):
        self.volume_property = volume_property
        self.renderer = renderer
        self.render_window = render_window
        self.mapper = mapper
        self.image_data = image_data
        self.color_tf = color_transfer_function
        self.opacity_tf = opacity_transfer_function
            

        self.enabled = False

        # Lighting / material
        self.ambient = volume_property.GetAmbient()
        self.diffuse = volume_property.GetDiffuse()
        self.specular = volume_property.GetSpecular()
        self.specular_power = volume_property.GetSpecularPower()

        # Cinematic
        self.quality = 1.0
        self.scattering = 0.0

        # Volume display
        self.brightness = 0.0
        self.contrast = 1.0

        # Window/level
        self.window_width = None
        self.window_level = None

        # Saved state before cinematic mode
        self._original_settings = None
        self._original_lights = []

        # Cinematic lights
        self._lights = {}

        self._setup_default_lighting()

    ################### Rendering ###################

    def render(self):
        """Force a VTK render."""
        if self.render_window is not None:
            self.render_window.Render()


    ################### Cinematic rendering ###################

    def enable(self):
        """Enable cinematic rendering."""
        if self.enabled: return
        self._save_original_settings()
        self.enabled = True
        self._setup_cinematic_lighting()
        self._apply_cinematic_settings()

    def disable(self):
        """Disable cinematic rendering and restore the previous state."""
        if not self.enabled: return
        self.enabled = False
        self._restore_original_settings()
        self._restore_original_lighting()
        self.render()

    def toggle(self, enabled=None):
        """
        Toggle cinematic rendering.
        """
        if enabled is None: enabled = not self.enabled

        if enabled: self.enable()
        else: self.disable()


    ################### Cinematic quality ###################


    def set_quality(self, quality):
        """
        Set cinematic quality. "low", "medium", "high", "ultra"
        """

        if isinstance(quality, str):
            quality_lower = quality.lower()

            if quality_lower not in self.QUALITY_LEVELS:
                raise ValueError( f"[Cinematic Rendering]Unknown cinematic quality '{quality}'.Expected one of: {list(self.QUALITY_LEVELS.keys())}")

            self.quality = self.QUALITY_LEVELS[quality_lower]

        else:
            self.quality = float(quality)

        if self.enabled:
            self._apply_sampling()
            self.render()

    ################### Cinematic scattering ###################

    def set_scattering(self, value):
        """Set volumetric scattering blending."""
        self.scattering = float(value)
        if self.enabled:
            self._apply_scattering()
            self.render()

    ################### Lighting ###################


    def set_ambient(self, value):
        self.ambient = float(value)
        self.volume_property.SetAmbient(self.ambient)
        self.render()

    def set_diffuse(self, value):
        self.diffuse = float(value)
        self.volume_property.SetDiffuse(self.diffuse)
        self.render()

    def set_specular(self, value):
        self.specular = float(value)
        self.volume_property.SetSpecular(self.specular)
        self.render()

    def set_specular_power(self, value):
        self.specular_power = float(value)
        self.volume_property.SetSpecularPower(self.specular_power)
        self.render()


    def update_lighting( self, ambient=None, diffuse=None, specular=None,specular_power=None,):
        """Update multiple material/light properties."""
        if ambient is not None:
            self.ambient = float(ambient)
        if diffuse is not None:
            self.diffuse = float(diffuse)
        if specular is not None:
            self.specular = float(specular)
        if specular_power is not None:
            self.specular_power = float(specular_power)
        self._apply_lighting()
        self.render()

    def _apply_lighting(self):
        self.volume_property.SetAmbient(self.ambient)
        self.volume_property.SetDiffuse(self.diffuse)
        self.volume_property.SetSpecular(self.specular)
        self.volume_property.SetSpecularPower(self.specular_power)
        self.volume_property.ShadeOn()

    ################### Brightness / contrast ###################

    def set_brightness(self, value):
        """
        Set brightness adjustment.
        """
        self.brightness = float(value)
        self._apply_brightness_contrast()


    def set_contrast(self, value):
        """
        Set contrast adjustment.
        """
        self.contrast = max(float(value), 0.0)
        self._apply_brightness_contrast()

    def _apply_brightness_contrast(self):
        """
        Apply brightness/contrast to the current transfer functions.
        """
        # If there are no points, there is nothing to transform.
        color_count = self.color_tf.GetSize()
        opacity_count = self.opacity_tf.GetSize()
        if color_count == 0 and opacity_count == 0: return


        if self.image_data is not None:
            scalars = self.image_data.GetPointData().GetScalars()

            if scalars is not None:
                scalar_range = scalars.GetRange()
                center = ( scalar_range[0] + scalar_range[1] ) * 0.5
                width = ( scalar_range[1] - scalar_range[0] )
                if width > 0:
                    center += self.brightness * width
                    width /= max(self.contrast, 0.001)
                    self._apply_window_center(width,center)
        self.render()

    ################### Window / level ###################

    def set_window_width(self, value):
        """Set CT window width."""
        self.window_width = float(value)
        self._apply_window_center(self.window_width,self.window_level)

    def set_window_level(self, value):
        """Set CT window level."""
        self.window_level = float(value)
        self._apply_window_center(self.window_width,self.window_level)

    def _apply_window_center(self, width, level):
        """
        Apply window width/level to the transfer functions.
        """
        if width is None or level is None: return
        width = max(float(width), 0.0001)
        level = float(level)
        low = level - width * 0.5
        high = level + width * 0.5
        # We don't destroy the frontend's transfer function here.
        # Window/level is primarily stored as state. The frontend can send
        # the resulting transfer function explicitly through
        # set_transfer_function.
        # This avoids silently destroying a user-defined medical preset.
        self._window_low = low
        self._window_high = high

        self.render()

    ################### Transfer function ###################

    def set_transfer_function(self,intensities,opacities,colors,preset=None):
        """
        Replace the complete transfer function.
        Frontend format:
            intensities = [i0, i1, i2, ...]
            opacities = [o0, o1, o2, ...]
            colors = [r0, g0, b0,r1, g1, b1,...]
        """

        if len(intensities) != len(opacities):
            raise ValueError("[Cimeatic Rendering]intensities and opacities must have the same length.")

        if len(colors) != len(intensities) * 3:
            raise ValueError("[Cimeatic Rendering]colors must contain exactly 3 values per control point.")

        if len(intensities) == 0:
            raise ValueError("[Cimeatic Rendering]Transfer function must contain at least one point.")

        # Clear existing functions
        self.color_tf.RemoveAllPoints()
        self.opacity_tf.RemoveAllPoints()

        # Rebuild
        for index, scalar in enumerate(intensities):
            scalar = float(scalar)
            opacity = float(opacities[index])
            color_index = index * 3
            r = float(colors[color_index])
            g = float(colors[color_index + 1])
            b = float(colors[color_index + 2])
            self.color_tf.AddRGBPoint(scalar,r,g,b)
            self.opacity_tf.AddPoint(scalar,opacity)

        # Make sure the volume property uses these functions.
        self.volume_property.SetColor(self.color_tf)
        self.volume_property.SetScalarOpacity(self.opacity_tf)

        # Remember which preset generated this TF.
        self.transfer_function_preset = preset

        self.render()

    ################### Lighting ###################

    def _setup_default_lighting(self):
        """Normal rendering lighting."""
        self.renderer.RemoveAllLights()
        headlight = vtk.vtkLight()
        headlight.SetLightTypeToHeadlight()
        headlight.SetIntensity(1.0)
        headlight.SetColor(1.0, 1.0, 1.0)
        self.renderer.AddLight(headlight)
        self.renderer.SetTwoSidedLighting(True)

    def _setup_cinematic_lighting(self):
        """Three-point cinematic lighting."""
        self.renderer.RemoveAllLights()
        key = vtk.vtkLight()
        key.SetLightTypeToCameraLight()
        key.SetIntensity(0.8)
        key.SetColor(1.0, 1.0, 1.0)
        fill = vtk.vtkLight()
        fill.SetLightTypeToCameraLight()
        fill.SetIntensity(0.3)
        fill.SetColor(0.9, 0.9, 1.0)

        rim = vtk.vtkLight()
        rim.SetLightTypeToCameraLight()
        rim.SetIntensity(0.2)
        rim.SetColor(1.0, 0.95, 0.9)
        self._lights = {"key": key,"fill": fill,"rim": rim}
        self.renderer.AddLight(key)
        self.renderer.AddLight(fill)
        self.renderer.AddLight(rim)
        self.renderer.SetTwoSidedLighting(True)

    def set_light_intensity(self, light_name, intensity):
        light = self._get_light(light_name)
        light.SetIntensity(float(intensity))
        self.render()

    def set_light_color(self, light_name, color):
        if len(color) != 3:
            raise ValueError("[Cinematic Rendering]Light color must contain 3 values.")
        light = self._get_light(light_name)
        light.SetColor(float(color[0]),float(color[1]),float(color[2]))
        self.render()

    def set_light_position(self, light_name, position):
        if len(position) != 3:
            raise ValueError("[Cinematic Rendering]Light position must contain 3 values.")
        light = self._get_light(light_name)
        light.SetPosition(float(position[0]),float(position[1]),float(position[2]))
        self.render()

    def set_light_focal_point(self,light_name,focal_point ):
        if len(focal_point) != 3:
            raise ValueError("[Cinematic Rendering] Light focal point must contain 3 values.")
        light = self._get_light(light_name)
        light.SetFocalPoint(float(focal_point[0]),float(focal_point[1]),float(focal_point[2]))
        self.render()

    def set_light(self,light_name,intensity=None,color=None,position=None,focal_point=None):

        light = self._get_light(light_name)
        if intensity is not None:
            light.SetIntensity(float(intensity))
        if color is not None:
            light.SetColor(float(color[0]),float(color[1]),float(color[2]))
        if position is not None:
            light.SetPosition(float(position[0]),float(position[1]),float(position[2]))
        if focal_point is not None:
            light.SetFocalPoint(float(focal_point[0]),float(focal_point[1]),float(focal_point[2]))
        self.render()

    def _get_light(self, light_name):
        try:
            return self._lights[light_name]
        except KeyError:
            raise ValueError(f"[Cinematic Rendering]Unknown cinematic light '{light_name}'. ")

    ################### Cinematic application ###################

    def _apply_cinematic_settings(self):
        self._apply_lighting()
        self._apply_sampling()
        self._apply_scattering()

        if self.image_data is not None:
            self._apply_gradient_opacity()
        self.render()

    def _apply_sampling(self):
        if self.mapper is None or self.image_data is None:
            return
        spacing = self.image_data.GetSpacing()
        base_distance = sum(spacing) / 3.0
        sample_distance = base_distance / max(0.5 * self.quality ** 2, 0.001)
        self.mapper.SetSampleDistance(sample_distance)
        self.mapper.SetAutoAdjustSampleDistances(True)

    def _apply_scattering(self):
        if self.mapper is None: return
        if hasattr(self.mapper,"SetVolumetricScatteringBlending"):
            self.mapper.SetVolumetricScatteringBlending(self.scattering)

    def _apply_gradient_opacity(self):
        scalars = (self.image_data.GetPointData().GetScalars())
        if scalars is None:
            return
        scalar_range = scalars.GetRange()
        gradient_range = (scalar_range[1] - scalar_range[0])
        if gradient_range <= 0:
            return
        gradient_max = gradient_range * 0.01
        gradient_tf = vtk.vtkPiecewiseFunction()
        gradient_tf.AddPoint(0.0, 0.0)
        gradient_tf.AddPoint(gradient_max,1.0)
        self.volume_property.SetGradientOpacity(0,gradient_tf)
        self.volume_property.DisableGradientOpacityOff()

    ################### save/restore ###################

    def _save_original_settings(self):
        """
        Save the volume state before cinematic mode changes it.
        """
        self._original_settings = {
            "ambient": self.volume_property.GetAmbient(),
            "diffuse": self.volume_property.GetDiffuse(),
            "specular": self.volume_property.GetSpecular(),
            "specular_power": (self.volume_property.GetSpecularPower()),
            "shade": self.volume_property.GetShade(),
            "interpolation": (self.volume_property.GetInterpolationType()),
        }
        if self.mapper is not None:
            self._original_settings["sample_distance"] = self.mapper.GetSampleDistance()
            self._original_settings["auto_adjust"] = self.mapper.GetAutoAdjustSampleDistances()

    def _restore_original_settings(self):
        if self._original_settings is None:
            return
        settings = self._original_settings
        self.volume_property.SetAmbient(settings["ambient"])
        self.volume_property.SetDiffuse(settings["diffuse"])
        self.volume_property.SetSpecular(settings["specular"])
        self.volume_property.SetSpecularPower(settings["specular_power"])

        if settings["shade"]:
            self.volume_property.ShadeOn()
        else:
            self.volume_property.ShadeOff()

        self.volume_property.SetInterpolationType(settings["interpolation"])

        if self.mapper is not None:
            self.mapper.SetSampleDistance(settings["sample_distance"])
            self.mapper.SetAutoAdjustSampleDistances(settings["auto_adjust"])
        self._original_settings = None

    def _restore_original_lighting(self):
        self._lights.clear()
        self._setup_default_lighting()