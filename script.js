const visualizationContainer = d3.select("#visualization-container");
let containerWidth = visualizationContainer.node().clientWidth;
let containerHeight = visualizationContainer.node().clientHeight;
let simulation;
let nodes = [];
const rotationSpeedFactor = 0.05 / 4; // Reduced speed to a quarter

document.addEventListener("DOMContentLoaded", function() {
    loadPointClouds(); // Automatically load point clouds
});

function rotate3D(points, angleX, angleY) {
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    return points.map(p => {
        let y = p[1] * cosX - p[2] * sinX;
        let z = p[1] * sinX + p[2] * cosX;
        let x = p[0] * cosY + z * sinY;
        z = z * cosY - p[0] * sinY;
        return {x: x, y: y, z: p.z, color: p.color};
    });
}

function updatePositions() {
    nodes.forEach(node => {
        const svg = visualizationContainer.select(`svg#${node.id}`);
        svg.style("left", `${Math.max(0, Math.min(containerWidth - 200, node.x))}px`)
           .style("top", `${Math.max(0, Math.min(containerHeight - 200, node.y))}px`);

        const points = rotate3D(node.points, node.angleX, node.angleY);
        const circles = svg.selectAll("circle").data(points);
        circles.join("circle")
               .attr("cx", point => node.scale(point.x))
               .attr("cy", point => node.scale(point.y))
               .attr("r", 2)
               .style("fill", point => point.color);
    });
}

function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = Math.max(0, Math.min(containerWidth - 200, event.x));
    d.fy = Math.max(0, Math.min(containerHeight - 200, event.y));
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function ticked() {
    nodes.forEach(node => {
        const svg = visualizationContainer.select(`svg#${node.id}`);
        svg.style("left", `${Math.max(0, Math.min(containerWidth - 200, node.x))}px`)
           .style("top", `${Math.max(0, Math.min(containerHeight - 200, node.y))}px`);

        const points = rotate3D(node.points, node.angleX, node.angleY);
        const circles = svg.selectAll("circle").data(points);
        circles.join("circle")
               .attr("cx", point => node.scale(point.x))
               .attr("cy", point => node.scale(point.y))
               .attr("r", 2)
               .style("fill", point => point.color);
    });
}

function loadPointClouds() {
    const numClouds = 6;  // Specify the desired number of point clouds to display
    d3.csv("attenuatedPos.csv").then(data => {
        console.log("Data loaded", data);  // This will show you what the script sees after loading
        let zValues = data.flatMap(d => JSON.parse(d.point_cloud).map(p => p[2]));
        const colorScale = d3.scaleSequential(d3.interpolateCool).domain([Math.min(...zValues), Math.max(...zValues)]);

        nodes = data.slice(0, numClouds).map((d, index) => {
            let points = JSON.parse(d['point_cloud']).map(p => ({
                ...p,
                color: colorScale(p[2])
            }));
            return {
                id: `node-${index}`,
                points: points,
                x: Math.random() * (containerWidth - 200),
                y: Math.random() * (containerHeight - 200),
                scale: d3.scaleLinear().domain([-1, 1]).range([10, 190]),
                radius: 100,
                angleX: 0,
                angleY: 0
            };
        });

        simulation = d3.forceSimulation(nodes)
            .force("charge", d3.forceManyBody().strength(-250)) // Stronger repulsion to evenly distribute nodes
            .force("collision", d3.forceCollide().radius(d => d.radius + 5)) // Prevent overlap with a slight padding
            .on("tick", ticked);

        visualizationContainer.selectAll("svg")
            .data(nodes)
            .enter().append("svg")
            .attr("id", d => d.id)
            .attr("style", d => `left: ${d.x}px; top: ${d.y}px`)
            .attr("width", 200)
            .attr("height", 200)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .each(function(d) {
                updatePositions();
            });

        requestAnimationFrame(animateRotation); // Continuous rotation
    }).catch(error => {
        console.error('Error loading or parsing the data:', error);
    });
}

function animateRotation() {
    nodes.forEach(node => {
        node.angleX += rotationSpeedFactor;
        node.angleY += rotationSpeedFactor * 0.5;
    });
    updatePositions();
    requestAnimationFrame(animateRotation); // Continue the animation loop
}
