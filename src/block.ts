import { BoxGeometry, Euler, Mesh, MeshToonMaterial, Vector3 } from 'three';

interface IDimension {
  width: number;
  height: number;
  depth: number;
}

export class Block {
  public direction: Vector3 = new Vector3(0, 0, 0);

  private mesh: Mesh;
  private material: MeshToonMaterial;
  private dimension: IDimension;

  constructor(width: number, height: number, depth: number) {
    this.dimension = { width, height, depth };
    this.material = new MeshToonMaterial();
    this.mesh = new Mesh(new BoxGeometry(width, height, depth), this.material);
  }

  public get position(): Vector3 {
    return this.mesh.position;
  }

  public get scale(): Vector3 {
    return this.mesh.scale;
  }

  public get rotation(): Euler {
    return this.mesh.rotation;
  }

  public get width(): number {
    return this.dimension.width;
  }

  public get height(): number {
    return this.dimension.height;
  }

  public get depth(): number {
    return this.dimension.depth;
  }

  public getMesh(): Mesh {
    return this.mesh;
  }

  public getDimension(): IDimension {
    return this.dimension;
  }

  public setColor(color: number): void {
    this.material.color.set(color);
  }

  public moveScalar(scalar: number): void {
    this.position.set(
      this.position.x + this.direction.x * scalar,
      this.position.y + this.direction.y * scalar,
      this.position.z + this.direction.z * scalar,
    );
  }

  public cut(targetBlock: Block): boolean {
    if (Math.abs(this.direction.x) > Number.EPSILON) {
      const overlap = targetBlock.width - Math.abs(this.position.x - targetBlock.position.x);
      if (overlap < 0) return false;

      this.dimension.width = overlap;  
      this.position.x = (targetBlock.position.x + this.position.x) * 0.5;
    } else {
      const overlap = targetBlock.depth - Math.abs(this.position.z - targetBlock.position.z);  
      if (overlap < 0) return false;

      this.dimension.depth = overlap;
      this.position.z = (targetBlock.position.z + this.position.z) * 0.5;
    }

    this.mesh.geometry.copy(new BoxGeometry(this.width, this.height, this.depth));

    return true;
  }
}
