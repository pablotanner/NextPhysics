export default class Rectangle {
  constructor(x, y, w, h) {
    this.x = x; // x-coordinate of the center
    this.y = y; // y-coordinate of the center
    this.w = w; // width of the rectangle
    this.h = h; // height of the rectangle
  }

  // Check if a point is inside the rectangle
  contains(point) {
    return (point.x >= this.x - this.w &&
            point.x <= this.x + this.w &&
            point.y >= this.y - this.h &&
            point.y <= this.y + this.h);
  }

  // Check if this rectangle intersects with another one
  intersects(range) {
    return !(range.x - range.w > this.x + this.w ||
             range.x + range.w < this.x - this.w ||
             range.y - range.h > this.y + this.h ||
             range.y + range.h < this.y - this.h);
  }
}