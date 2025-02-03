import { Exclude } from 'class-transformer';
import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

// Entity Inharitance
export class BaseTable {
  @CreateDateColumn()
  @Exclude() 
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude() 
  updatedAt: Date;

  @VersionColumn()
  @Exclude() 
  version: number;
}
