# Cursor-Reactive 3D Robot — Production Prompt

Use this prompt with a 3D scene generator or as an implementation brief for a Three.js/Spline artist:

> Create a premium, original 3D robot observer for an embedded-systems engineer’s portfolio. The robot should look like laboratory instrumentation rather than a toy: brushed graphite and cool silver housing, a glossy black visor, two cyan optical sensors, restrained violet status lights, a small antenna, visible shoulder joints, and one circular chest telemetry core. Keep the silhouette clean and readable against a near-black background.
>
> The robot must react to the visitor’s pointer. Calculate a normalized look target from the pointer relative to the robot canvas. Smooth the current target toward it with a `0.15` lerp on every animation frame. Move only the pupils within their sockets by a tightly clamped amount, then apply a smaller matching yaw/pitch to the head. Never let a pupil cross the eye housing. On touch devices, replace pointer tracking with a slow sine-wave idle scan. When `prefers-reduced-motion` is enabled, center the eyes and disable floating, pulsing, and idle motion.
>
> Add subtle continuous life: the whole body floats by roughly `sin(time * 1.05) * 0.065` world units; the antenna and chest core pulse gently; the arms counter-sway by less than two degrees. Pause rendering while the component is off-screen or the browser tab is hidden. Limit device-pixel ratio on mobile. The scene must be transparent so the site-wide Canvas2D dither tower remains visible behind it.
>
> Do not include text, logos, a second ASCII layer, a circuit-board hero object, or a generic amorphous blob. The final composition must work in a right-aligned hero area on desktop and degrade cleanly behind the text scrim on mobile.

The production site implements this brief directly in Three.js at `components/effects/robot-3d.tsx`; it does not depend on a third-party scene URL.
