export default function findClosestElement({mousePosition, objects}) {
    // Start from newly added objects (ones furthest in front)
    return [...objects].reverse().find(object => {
        // Find object that directly intersects with mouse click
        const intersectData = object.intersectPoint(mousePosition);
        if (intersectData.doesIntersect){
            return object;
        }
    })
}