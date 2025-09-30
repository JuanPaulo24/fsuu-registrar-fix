export default function checkTouchOnly() {
    return window.matchMedia("(any-hover: none)").matches;
}
