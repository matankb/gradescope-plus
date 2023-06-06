import cumulativeGrade from "./modules/cumulative-grade/cumulative-grade";
import getNewGraded, { highlightNewGraded, showMarkAsRead } from "./modules/grade-notification";

const MODULE_MAP = {
    '/': [getNewGraded],
    '/courses': [cumulativeGrade, showMarkAsRead, highlightNewGraded]
}

function runExtension() {
    const { pathname } = window.location;
    const modules = MODULE_MAP[pathname];
    for (const module of modules) {
        module();
    }
}


runExtension();