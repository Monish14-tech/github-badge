import fetch from 'node-fetch';
import fs from 'fs';

let userName = "Monish14-tech";

let pipelineRun = true; // Set to false for local debugging
let templateFile = 'github-repo-count-template.svg';
let outputFile = 'github-repo-count.svg';
let apiURL = "https://api.github.com/users/";
let repoCountUrl = apiURL + userName;

fetch(repoCountUrl, {
    method: 'get',
    headers: {'Content-Type': 'application/json'}
})
    .then((res) => res.json())
    .then((json) => {
        updateBadge(json.public_repos);
    });

function updateBadge(repoCount) {
    try {
        console.log("Received count of " + repoCount + " repos from GitHub API");
        let templateData = readFile(templateFile);
        let compiledBadge = compileTemplate(templateData, repoCount);
        let oldBadge = readFile(outputFile);

        if (oldBadge === compiledBadge) {
            console.log("Badge data has not changed. Skipping commit.");
            setUpdateBannerEnv("false");
        } else {
            console.log("Updating badge ...");
            fs.writeFileSync("./" + outputFile, compiledBadge);
            console.log("Updated " + outputFile + " successfully");
            setUpdateBannerEnv("true")
        }
    } catch (error) {
        console.error(error);
    }
}

function setUpdateBannerEnv(value) {
    setEnv("update-badge", value);
}

function setEnv(key, value) {
    if (pipelineRun) {
        fs.writeFileSync(process.env.GITHUB_ENV, key + "=" + value);
    } else {
        console.log("New Property: " + key + "=" + value);
    }
}

function readFile(file) {
    return fs.readFileSync("./" + file, 'utf8');
}

function compileTemplate(template, repoCount) {
    let compiled = setTemplateVar(template, "repoCount", repoCount);
    return setTemplateVar(compiled, "length", calculateSize(repoCount));
}

function setTemplateVar(template, name, value) {
    return template.replaceAll("${" + name + "}", value);
}

function calculateSize(number) {
    let letterSize = 80;
    return size(number) * letterSize;
}

function size(number) {
    return Math.abs(number).toString().length;
}
