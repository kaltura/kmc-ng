import { SchemasTableComponent } from './schemas-table/schemas-table.component';
import { SchemasListComponent } from './schemas-list/schemas-list.component';
import { CustomSchemaComponent } from './custom-schema/custom-schema.component';
import { CustomSchemaFieldsTableComponent } from './custom-schema/custom-schema-fields-table/custom-schema-fields-table.component';
import { CustomSchemaFormComponent } from './custom-schema/custom-schema-form/custom-schema-form.component';
import { CustomSchemaTypePipe } from './pipes/custom-schema-type.pipe';
import { CustomSchemaFieldFormComponent } from './custom-schema/custom-schema-field-form/custom-schema-field-form.component';
import { MetadataObjectTypePipe } from './pipes/metadata-object-type.pipe';

export const SchemasComponents = [
  SchemasTableComponent,
  SchemasListComponent,
  CustomSchemaComponent,
  CustomSchemaFieldsTableComponent,
  CustomSchemaFormComponent,
  CustomSchemaTypePipe,
  MetadataObjectTypePipe,
  CustomSchemaFieldFormComponent
];
