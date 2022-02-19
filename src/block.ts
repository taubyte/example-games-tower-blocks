import { BoxGeometry, Euler, Mesh, MeshToonMaterial, Vector3 } from 'three';

export class Block {
  public direction: Vector3 = new Vector3(0, 0, 0);

  private mesh: Mesh;
  private material: MeshToonMaterial;

  constructor(scale: Vector3) {
    this.material = new MeshToonMaterial();
    this.mesh = new Mesh(new BoxGeometry(1, 1, 1), this.material);
    this.mesh.scale.copy(scale);
  }

  // prettier-ignore
  public get position(): Vector3 { return this.mesh.position; }
  // prettier-ignore
  public get rotation(): Euler { return this.mesh.rotation; }
  // prettier-ignore
  public get scale(): Vector3 { return this.mesh.scale; }

  // prettier-ignore
  public get x(): number { return this.mesh.position.x; }
  // prettier-ignore
  public get y(): number { return this.mesh.position.y; }
  // prettier-ignore
  public get z(): number { return this.mesh.position.z; }

  // prettier-ignore
  public set x(value: number) { this.mesh.position.x = value; }
  // prettier-ignore
  public set y(value: number) { this.mesh.position.y = value; }
  // prettier-ignore
  public set z(value: number) { this.mesh.position.z = value; }

  // prettier-ignore
  public get width(): number { return this.scale.x; }
  // prettier-ignore
  public get height(): number { return this.scale.y; }
  // prettier-ignore
  public get depth(): number { return this.scale.z; }

  public getMesh(): Mesh {
    return this.mesh;
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
      const overlap = targetBlock.width - Math.abs(this.x - targetBlock.x);
      if (overlap < 0) return false;

      this.scale.x = overlap;
      this.position.x = (targetBlock.x + this.x) * 0.5;
    } else {
      const overlap = targetBlock.depth - Math.abs(this.z - targetBlock.z);
      if (overlap < 0) return false;

      this.scale.z = overlap;
      this.position.z = (targetBlock.z + this.z) * 0.5;
    }

    return true;
  }
}
