import Playground from "./playground";

import "./public/styles.css";


export const babylonInit = async () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const playground = new Playground(canvas);
    await playground.init();
}

babylonInit().then(() => {});