import React, { useEffect } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  Vector2,
  HemisphericLight,
  MeshBuilder,
  FreeCamera,
  ShaderMaterial
} from '@babylonjs/core';
import './css/style.css';
import { WaterShader } from './shader/water-shader';


const BabylonEngine: React.FC = () => {
  useEffect(() => {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    const engine = new Engine(canvas, true);

    const createScene = () => {
      const scene = new Scene(engine);
      const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 4, 3, new Vector3(0, 0, 0), scene);
      //const camera = new FreeCamera('camera', new Vector3(0,1,-10), scene);
      camera.attachControl(canvas, true);

      const hemiLight = new HemisphericLight('light1', new Vector3(1, 1, 0), scene);
      hemiLight.intensity = 1;

      const sphere = MeshBuilder.CreateSphere('sphere', { segments: 16, diameter: 2 }, scene);
      sphere.position.y = 2;

    //   const plane = MeshBuilder.CreatePlane('plane', { size: 16, width: 10, height: 10  }, scene);
    //   plane.position = new Vector3(0, -1, 0);
    //   plane.rotation = new Vector3(90, 0, 90);

    const ground = MeshBuilder.CreateGround("ground", {width: 100, height: 100, subdivisions: 1000}, scene);
    ground.position = new Vector3(0, -1, 0);

    // Apply water shader to ground
    WaterShader(scene, ground, {steepness: .5, waveLength: 20, direction: new Vector2(.5,.4)}, {steepness: .8, waveLength: 3, direction: new Vector2(1,1)}, {steepness: .2, waveLength: 4, direction: new Vector2(1,.3)});

      return {scene, ground, hemiLight};
    };

    const {scene, ground, hemiLight} = createScene();
    const groundShaderMaterial =  ground.material as ShaderMaterial;

    let startTime = performance.now(); 
    engine.runRenderLoop(() => {

      const currentTime = (performance.now() - startTime) / 1000.00;
      groundShaderMaterial.setFloat("time", currentTime);  
      groundShaderMaterial.setVector3("lightDir", hemiLight.direction);
      groundShaderMaterial.backFaceCulling = false;

      scene.render();
    });

    window.addEventListener('resize', () => {
      engine.resize();
    });
  }, []);

  return (
    <div>
      <canvas id="renderCanvas" />
    </div>
  );
};

export default BabylonEngine;
