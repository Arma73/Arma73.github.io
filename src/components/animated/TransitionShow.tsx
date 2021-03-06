import { FC, ReactNode } from "react";
import { useTransition, animated } from "react-spring";

interface TransitionShowProps {
    "show": boolean;
    "render": ReactNode;
}

const TransitionShow: FC<TransitionShowProps> = ({ show, render }) => {
    const transitions = useTransition(show, null, {
        "from": { "opacity": 0 },
        "enter": { "opacity": 1 },
        "leave": { "opacity": 0 },
    });

    return (
        <>
            {transitions.map(
                ({ item, key, props }) =>
                    item && (
                        <animated.div
                            key={key}
                            style={props}
                            className="non-selective"
                        >
                            {render}
                        </animated.div>
                    )
            )}
        </>
    );
};

export default TransitionShow;
