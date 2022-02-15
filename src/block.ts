import { BoxGeometry, Matrix4, Mesh, MeshToonMaterial, Vector3 } from 'three';

export class Block {
  public direction: Vector3 = new Vector3(0, 0, 0);

  private mesh: Mesh;
  private material: MeshToonMaterial;

  private width: number;
  private height: number;
  private depth: number;

  constructor(width: number, height: number, depth: number) {
    this.width = width;
    this.height = height;
    this.depth = depth;

    const geometry = new BoxGeometry(width, height, depth);

    geometry.applyMatrix4(
      new Matrix4().makeTranslation(width / 2, height / 2, depth / 2),
    );

    this.material = new MeshToonMaterial({
      color: 0x333344,
    });

    this.mesh = new Mesh(geometry, this.material);
  }

  public get position() {
    return this.mesh.position;
  }

  public getMesh() {
    return this.mesh;
  }

  public getDimesion() {
    return { width: this.width, height: this.height, depth: this.depth };
  }

  public setColor(color: number) {
    this.material.color.set(color);
  }

  public moveScalar(scalar: number) {
    this.position.set(
      this.position.x + this.direction.x * scalar,
      this.position.y + this.direction.y * scalar,
      this.position.z + this.direction.z * scalar,
    );
  }
}
