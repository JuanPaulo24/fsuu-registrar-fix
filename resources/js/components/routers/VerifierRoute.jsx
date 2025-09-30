import PropTypes from "prop-types";

export default function VerifierRoute(props) {
    const { component: Component, ...rest } = props;

    // This route is accessible to everyone regardless of authentication status
    return <Component {...rest} />;
}

VerifierRoute.propTypes = {
    component: PropTypes.elementType.isRequired,
};
