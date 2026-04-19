import Node from "./node";

export default class CricleNode extends Node {
  constructor({ graphView, dataModel, id, attributes = {} }) {
    super({ graphView, dataModel, id, attributes });
    this.type = "circle";
  }

  containsPoint(pointX, pointY) {
    const cx = Number(this.attributes.x);
    const cy = Number(this.attributes.y);
    const r = Number(this.attributes.radius);
    if (
      !Number.isFinite(cx) ||
      !Number.isFinite(cy) ||
      !Number.isFinite(r) ||
      r < 0
    )
      return false;
    const dx = pointX - cx;
    const dy = pointY - cy;
    let distanceSquared = Math.pow(dx, 2) + Math.pow(dy, 2);
    let radiusSquared = Math.pow(r, 2);
    return distanceSquared <= radiusSquared;
  }

  draw() {
    let ctx = this.graphView.getCtx();
    let scale = this.graphView.getScale();
    ctx.beginPath();
    ctx.arc(
      this.attributes.x * scale,
      this.attributes.y * scale,
      this.attributes.radius * scale,
      0,
      Math.PI * 2,
      true
    );
    ctx.closePath();
    ctx.closePath();
    ctx.fillStyle = this.attributes.backgroundColor || "transparent";
    ctx.fill();
    ctx.strokeStyle = this.attributes.borderColor || "transparent";
    ctx.lineWidth = this.attributes.borderWidth * scale;
    ctx.stroke();
  }

  getBoundingBox() {
    return {
      x: this.attributes.x - this.attributes.radius,
      y: this.attributes.y - this.attributes.radius,
      width: this.attributes.radius * 2,
      height: this.attributes.radius * 2,
    };
  }

  move(dx, dy) {
    super.move(dx, dy);
    this.attributes.x += dx;
    this.attributes.y += dy;
  }

  setCenter(x, y) {
    super.setCenter(x, y);
    this.attributes.x = x;
    this.attributes.y = y;
  }
}
