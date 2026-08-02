import * as React from 'react';

export const Select = ({ children, onValueChange, defaultValue }: any) => <div>{children}</div>;
export const SelectTrigger = ({ children, className }: any) => <div className={className}>{children}</div>;
export const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;
export const SelectContent = ({ children }: any) => <div>{children}</div>;
export const SelectItem = ({ children, value }: any) => <option value={value}>{children}</option>;
