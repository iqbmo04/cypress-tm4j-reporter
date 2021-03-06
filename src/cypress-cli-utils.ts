import {TestResult, TestRun} from "./test-results";
import {Tm4jOptions} from "./tm4j-utils";
import "cypress"

export class CypressCliUtils {
    static convertCypressRunResult(results: CypressCommandLine.CypressRunResult, options: Tm4jOptions) {
        let testRuns: TestRun[]
        if (!options.specMapping || options.specMapping === "cycle") {
            testRuns = this.convertSpecsToTestCycles(results, options)
        } else {
            testRuns = this.convertSpecsToTests(results, options)
        }
        return testRuns
    }

    private static convertSpecsToTests(results: CypressCommandLine.CypressRunResult, options: Tm4jOptions) {
        let testRun = new TestRun()
        let testCycleName = options.cycleName
        testRun.name = testCycleName
            ? testCycleName
            : "Cypress Test Cycle"
        testRun.results = []
        results.runs.forEach(r => {
            let testResult = new TestResult()
            testResult.name = r.tests[0].title[0]
            testResult.status = r.stats.tests === r.stats.passes
                ? "passed"
                : "failed"

            testResult.duration = this.extractDurationForRunResult(r)
            testResult.comment = this.extractErrorMessageForRunResult(r)
            testResult.environment = this.extractEnvironmentVariable(results, options)
            testRun.results.push(testResult)
        })
        return [testRun]
    }

    private static extractDurationForRunResult(runResult: CypressCommandLine.RunResult) {
        return  runResult.stats.duration;
    }

    private static extractErrorMessageForRunResult(runResult: CypressCommandLine.RunResult) {
        let failure = runResult.tests.find(t => t.displayError)
        return failure ? failure.displayError : undefined
    }

    private static convertSpecsToTestCycles(results: CypressCommandLine.CypressRunResult, options: Tm4jOptions) {
        let testRuns: TestRun[] = []
        results.runs.forEach(r => {
            let testRun = new TestRun()
            testRun.name = r.tests[0].title[0]
            testRun.results = []
            r.tests.forEach(tr => {
                let testResult = new TestResult()
                testResult.name = tr.title[1]
                testResult.status = tr.state
                testResult.duration = this.extractDurationForTestResult(tr)
                testResult.comment = this.extractErrorMessageForTestResult(tr)
                testResult.environment = this.extractEnvironmentVariable(results, options)
                testRun.results.push(testResult)
            })
            testRuns.push(testRun)
        })
        return testRuns
    }

    private static extractErrorMessageForTestResult(testResult: CypressCommandLine.TestResult) {
        return testResult.displayError
    }

    private static extractDurationForTestResult(testResult: CypressCommandLine.TestResult) {
        let duration = 0;
        testResult.attempts.forEach(a => {
            duration += a.duration
        })
        return duration
    }

    private static extractEnvironmentVariable(results: CypressCommandLine.CypressRunResult, options: Tm4jOptions) {
        let envVariable = options.environmentProperty
        if (envVariable) {
            return results.config.env[envVariable]
        } else {
            return undefined
        }
    }
}
