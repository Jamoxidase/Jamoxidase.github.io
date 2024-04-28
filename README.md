[View Here](https://jamoxidase.github.io)

currently renders an interactive view of mandelbrot set.


Key .js components:
drawMandelbrot Function: This function generates the Mandelbrot fractal by iterating over each pixel in the canvas, calculating the corresponding complex number, and determining its escape time (number of iterations until divergence). The escape time is used to assign colors to the pixels.

renderingQueue and renderNext Functions: A queue is used to manage rendering tasks asynchronously. The renderNext function dequeues tasks from the queue and renders the fractal with updated parameters.

queueRendering Function: This function adds a rendering task to the queue and starts the rendering loop if the queue was previously empty.

handleZoom Function: This function handles zooming in and out of the fractal when the user scrolls using the mouse wheel. It calculates the new zoom level and offsets based on the mouse position and queues a rendering task.

Event Listener: An event listener is added to the canvas element to detect mouse wheel events for zooming.
Initial Rendering: Finally, the Mandelbrot fractal is initially rendered using the drawMandelbrot function.
