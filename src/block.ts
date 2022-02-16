import { BoxGeometry, Matrix4, Mesh, MeshToonMaterial, Vector3 } from 'three';

export class Block {
  public direction: Vector3 = new Vector3(0, 0, 0);

  private mesh: Mesh;
  private material: MeshToonMaterial;
  private dimension: {
    width: number;
    height: number;
    depth: number;
  };

  constructor(width: number, height: number, depth: number) {
    this.dimension = { width, height, depth };

    const geometry = new BoxGeometry(width, height, depth);
    geometry.applyMatrix4(
      new Matrix4().makeTranslation(width / 2, height / 2, depth / 2),
    );

    this.material = new MeshToonMaterial();

    this.mesh = new Mesh(geometry, this.material);
  }

  public get position() {
    return this.mesh.position;
  }

  public get scale() {
    return this.mesh.scale;
  }

  public get rotation() {
    return this.mesh.rotation;
  }

  public get width() {
    return this.dimension.width;
  }

  public get height() {
    return this.dimension.height;
  }

  public get depth() {
    return this.dimension.depth;
  }

  public getMesh() {
    return this.mesh;
  }

  public getDimension() {
    return this.dimension;
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

  public cut(targetBlock: Block) {
    if (this.direction.x !== 0) {
      const overlap = targetBlock.width - Math.abs(this.position.x - targetBlock.position.x);
      if (overlap < 0) return false;

      this.dimension.width = overlap;  
      if (this.position.x < targetBlock.position.x) {
        this.position.x = targetBlock.position.x;
      }
    } else {
      const overlap = targetBlock.depth - Math.abs(this.position.z - targetBlock.position.z);  
      if (overlap < 0) return false;

      this.dimension.depth = overlap;
      if (this.position.z < targetBlock.position.z) {
        this.position.z = targetBlock.position.z;
      }
    }

    const geometry = new BoxGeometry(this.width, this.height, this.depth);
    geometry.applyMatrix4(
      new Matrix4().makeTranslation(this.width / 2, this.height / 2, this.depth / 2),
    );

    this.mesh.geometry.copy(geometry);
  }
}
