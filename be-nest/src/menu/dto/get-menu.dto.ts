import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMenuHierarchyDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  parentId?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetMenuHierarchyDto)
  children: GetMenuHierarchyDto[];
}
