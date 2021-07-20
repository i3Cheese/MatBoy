import React, {ComponentProps, FC} from "react";
import {Box, BoxProps, BoxTitle} from "./Box";
import {ListGroup, ListGroupProps} from "react-bootstrap";

const RawFormBox: FC<BoxProps> = ({children, ...props}) => {
    return (
        <Box {...props}>
            <ListGroup variant="flush">{children}</ListGroup>
        </Box>
    );
}


export const FormItem: FC<ComponentProps<typeof ListGroup.Item>> = ({children, ...props}) => (
    <ListGroup.Item {...props}>
        {children}
    </ListGroup.Item>
)

export const FormGroup: FC<ComponentProps<typeof ListGroup>> = ({children, ...props}) => (
    <ListGroup variant="flush" {...props} >
        {children}
    </ListGroup>
)

export const FormTitle: FC<ComponentProps<typeof FormItem>> = ({children, ...props}) => (
    <FormItem {...props}>
        <BoxTitle>{children}</BoxTitle>
    </FormItem>
)

export const FormAdditions: FC<ListGroupProps> = ({children, style, ...props}) => (
    <ListGroup variant="flush" {...props}>
        <FormItem style={{padding: 0, ...style}}/>
        {children}
    </ListGroup>
)

const FormBox = Object.assign(RawFormBox, {
    Item: FormItem,
    Group: FormGroup,
    Title: FormTitle,
    Additions: FormAdditions,
});
export default FormBox;
