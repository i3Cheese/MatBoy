import React, {ComponentProps, FC} from "react";
import {Box, BoxProps, BoxTitle} from "./Box";
import {ListGroup} from "react-bootstrap";

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

export const FormTitle: FC<ComponentProps<typeof FormItem>> = ({children, ...props}) => (
    <FormItem {...props}>
        <BoxTitle>{children}</BoxTitle>
    </FormItem>
)

const FormBox = Object.assign(RawFormBox, {
    Item: FormItem,
    Title: FormTitle,
});
export default FormBox;
