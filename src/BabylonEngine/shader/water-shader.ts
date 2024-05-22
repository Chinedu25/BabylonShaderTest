import { Scene,  ShaderMaterial, Mesh, Vector4,Vector2} from '@babylonjs/core';



/**
 * WaterShaderProps interface for defining the properties needed for the water shader.
 * @property {number} steepness - The steepness of the water wave, clamped between 0 and 1.
 * @property {number} waveLength - The wavelength of the water wave.
 * @property {Vector2} direction - The direction of the water wave.
 */
interface WaterShaderProps{
    steepness: number;
    waveLength: number;
    direction: Vector2;
}

/**
 * Applies a water shader to a given mesh in a Babylon.js scene.
 * @param {Scene} scene - The Babylon.js scene where the shader will be applied.
 * @param {Mesh} ground - The mesh to which the shader will be applied.
 * @param {WaterShaderProps} waveA - The properties required for the water shader.
 */
export const WaterShader = (scene: Scene, ground: Mesh, waveA: WaterShaderProps, waveB?: WaterShaderProps,  waveC?: WaterShaderProps) => {

    waveA.steepness = Math.min(Math.max(waveA.steepness, 0), 1);

    if (waveA.steepness % 1 === 0) {
        waveA.steepness += 0.0001;
    }

    if (waveA.waveLength % 1 === 0) {
        waveA.waveLength += 0.0001;
    }

    if (waveB != null) {
        waveB.steepness = Math.min(Math.max(waveB.steepness, 0), 1);

        if (waveB.steepness % 1 === 0) {
            waveB.steepness += 0.0001;
        }
    
        if (waveB.waveLength % 1 === 0) {
            waveB.waveLength += 0.0001;
        }
    }

    if (waveC != null) {
        waveC.steepness = Math.min(Math.max(waveC.steepness, 0), 1);

        if (waveC.steepness % 1 === 0) {
            waveC.steepness += 0.0001;
        }
    
        if (waveC.waveLength % 1 === 0) {
            waveC.waveLength += 0.0001;
        }
    }


var vertexCode = `
    precision highp float;
    
    // Attributes
    attribute vec3 position;

    varying vec3 vNormal;
    
    // Uniforms
    // uniform float steepness;
    // uniform float waveLength;
    // uniform vec2 direction;

    uniform vec4 waveA;
    uniform vec4 waveB;
    uniform vec4 waveC;

    uniform float time;
    uniform mat4 worldViewProjection;

    vec3 GerstnerWave(vec4 wave, vec3 p, inout vec3 tangent, inout vec3 binormal){
        float steepness = wave.z;
        float waveLength = wave.w;
        float k = 2.0 * ${Math.PI} / waveLength;
        float c = sqrt(9.8 / k);
        vec2 d = normalize(wave.xy);
        float frequency = k * (dot(d, p.xz) - c * time);
        float amplitude = steepness / k;

        tangent += vec3(
            -d.x * d.x * (steepness * sin(frequency)),
            d.x * (steepness * cos(frequency)),
            -d.x * d.y * (steepness * sin(frequency))
        );
        binormal += vec3(
            -d.x * d.y * (steepness * sin(frequency)),
            d.y * (steepness * cos(frequency)),
            -d.y * d.y * (steepness * sin(frequency))
        );

        return vec3(
            d.x * (amplitude * cos(frequency)),
            amplitude * sin(frequency),
            d.y * (amplitude * cos(frequency))
        );
    }
    
    void main(void) {
       //vec3 p = position;
        // float k = 2.0 * ${Math.PI} / waveLength;
        // float c = sqrt(9.8 / k);
        // vec2 d = normalize(direction);
        // //float frequency = k * (p.x - c * time);
        // float frequency = k * (dot(d, p.xz) - c * time);
        // float amplitude = steepness / k;

        // p.x += d.x * (amplitude * cos(frequency));
        // p.y = amplitude * sin(frequency);
        // p.z += d.y * (amplitude * cos(frequency));
        
        // vec3 tangent = vec3( 1.0 - d.x * d.x * steepness * sin(frequency), 
        //                     d.x * steepness * cos(frequency), 
        //                     -d.x * d.y * steepness * sin(frequency));

        // vec3 binormal = vec3(-d.x * d.y * steepness * sin(frequency), 
        //                      d.y * steepness * cos(frequency), 
        //                      1.0 - d.y * d.y * steepness * sin(frequency));

        vec3 gridPoint = position;
        vec3 tangent = vec3(1.0, 0.0, 0.0);
        vec3 binormal = vec3(0.0, 0.0, 1.0);
        vec3 p = gridPoint;

        p += GerstnerWave(waveA, gridPoint, tangent, binormal);
        p += GerstnerWave(waveB, gridPoint, tangent, binormal);
        p += GerstnerWave(waveC, gridPoint, tangent, binormal);
    
        vec3 normal = normalize(cross(binormal, tangent));

        vNormal = normal;

    gl_Position = worldViewProjection * vec4(p, 1.0);
    }
`;

// Define fragment shader
var fragmentCode = `
    precision highp float;

    varying vec3 vNormal;
    uniform vec3 lightDir;

    // Light direction
    
    void main(void) {
        float diff = max(dot(vNormal, lightDir), 0.0);

        // Set the fragment color based on the lighting
        gl_FragColor = vec4(0.5 + 0.5 * diff, 1.0, 1.0, 1.0);
    }
`;

// Create the shader material
const shaderMaterial = new ShaderMaterial("shaderMaterial", scene, {
    vertexSource: vertexCode,
    fragmentSource: fragmentCode
  },
  {
    attributes: ["position"], 
    uniforms:  ["worldViewProjection", "waveA","waveB","waveC", "time"]
  });

// shaderMaterial.setFloat("steepness", waveA.steepness);
// shaderMaterial.setFloat("waveLength", waveA.waveLength);
shaderMaterial.setVector4("waveA", new Vector4(waveA.direction.x, waveA.direction.y, waveA.steepness,waveA.waveLength));
shaderMaterial.setVector4("waveB", waveB == null ? new Vector4(0.0001,0.0001,0.0001,0.0001) : new Vector4(waveB.direction.x, waveB.direction.y, waveB.steepness,waveB.waveLength));
shaderMaterial.setVector4("waveC", waveC == null ? new Vector4(0.0001,0.0001,0.0001,0.0001) : new Vector4(waveC.direction.x, waveC.direction.y, waveC.steepness,waveC.waveLength));


// Apply the shader material to the ground mesh
ground.material = shaderMaterial;

}