import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsInt()
  depth: number;

  @IsOptional()
  @IsInt()
  order?: number;
}
