export type BaseSettingsField<T> = {
  value: T;
  title: string;
  description: string;
  exposure: 'normal' | 'advanced' | 'secret';
};

export type SettingsFieldString = BaseSettingsField<string> & {
  type: 'string';
  enum?: string[];
};

export type SettingsFieldNumber = BaseSettingsField<number> & {
  type: 'number';
  minimum: number;
  maximum: number;
};

export type SettingsFieldInteger = BaseSettingsField<number> & {
  type: 'integer';
  minimum: number;
  maximum: number;
};

export type SettingsFieldBoolean = BaseSettingsField<boolean> & {
  type: 'boolean';
};

export type SettingsField =
  | SettingsFieldString
  | SettingsFieldNumber
  | SettingsFieldInteger
  | SettingsFieldBoolean;

export type SettingsSection = {
  title: string;
  description: string;
  fields: Record<string, SettingsField>;
};
