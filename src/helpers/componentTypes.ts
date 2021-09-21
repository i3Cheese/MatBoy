import * as React from 'react';

export type Omit<T, U> = Pick<T, Exclude<keyof T, keyof U>>;

export type ExcludeKeys<T, U> = Pick<T, Exclude<keyof T, U>>;

export type Replace<U, T> = Omit<U, T> & T;

export type ReplacePropsWithoutRef<Inner extends React.ElementType, P> = Replace<ComponentPropsWithoutRef<Inner>, P>
export type ReplaceProps<Inner extends React.ElementType, P> = Replace<React.ComponentProps<Inner>, P>


export type ComponentPropsWithoutRef<T extends React.ElementType> = ExcludeKeys<React.ComponentProps<T>, "ref">;

export type Intersection<T, U> = Exclude<T, Exclude<T, U>>;
export type IntersectionType<T, U> = Pick<T, Intersection<keyof T, keyof U>>;

export type IntersectionProps<T extends React.ElementType, U extends React.ElementType> =
    IntersectionType<ComponentPropsWithoutRef<T>, ComponentPropsWithoutRef<U>>;
