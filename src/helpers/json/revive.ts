// noinspection RegExpRedundantEscape
const iso8601re =/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/

function reviveDateTime(key: any, value: any) {
    if (typeof value === 'string') {
        let a = iso8601re.exec(value);
        if (a)
            return new Date(a[0]);
    }
    return value;
}

const revives = [reviveDateTime];

function revive(key: any, value: any) {
    for (let r of revives) {
        value = r(key, value);
    }
    return value;
}
export default revive;
export { reviveDateTime };
