import React, {FC} from "react";
import {Box, BoxProps} from "../../layout/Box/Box";
import {AppLoader} from "../../Loader";
import {InfoBox} from "../../layout/Box/InfoBox";
import {Col} from "react-bootstrap";
import {User} from "../../../types/models";
import {DateSpan} from "../../layout";


export interface UserInfoBoxProps extends BoxProps {
    user: User | null,
}

export const UserInfoBox: FC<UserInfoBoxProps> = ({user, title, ...props}) => (
    <Box type="square" title={title || user?.fullname || 'Пользователь...'} {...props} >
        {user === null ?
            <AppLoader/>
            :
            <InfoBox>
                {user.city &&
                <>
                    <Col sm={4} as={"dd"}>Город:</Col>
                    <Col sm={8} as={"dt"}>{user.city}</Col>
                </>
                }
                {user.birthday &&
                <>
                    <Col sm={4} as={"dd"}>Дата Рождения:</Col>
                    <Col sm={8} as={"dt"}><DateSpan date={user.birthday}/></Col>
                </>
                }
            </InfoBox>
        }
    </Box>
)