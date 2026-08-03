import * as React from 'react';

export const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => <div>{children}</div>;
export const DialogTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => <div>{children}</div>;
export const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>;
export const DialogHeader = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => <h2 className={className}>{children}</h2>;
export const DialogDescription = ({ children }: { children: React.ReactNode }) => <p>{children}</p>;
export const DialogFooter = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
