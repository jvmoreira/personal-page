let currentId = 0;
const getUniqueId = () => ++currentId;

const MouseButton = Object.freeze({
    LEFT: 0,
    SCROLL: 1,
    RIGHT: 2,
});

function buildPolygon(sides, width, height) {
    const smallerDimension = (width < height) ? width : height;
    const radius = .3 * smallerDimension;
    const centerX = .5 * width;
    const centerY = .5 * height;
    return { sides, centerX, centerY, radius };
}

function generatePolygonCoordinates({ sides, centerX, centerY, radius }) {
    return Array.from(Array(sides)).map((_, i) => {
        const x = centerX + radius * Math.cos(2 * Math.PI * i / sides);
        const y = centerY + radius * Math.sin(2 * Math.PI * i / sides);
        return [x, y];
    });
}
