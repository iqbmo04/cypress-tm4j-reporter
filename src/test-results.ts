export class TestRun {

    key: string
    name: string
    results: TestResult[]

}

export class TestResult {

    key: string
    name: string
    status: string
    duration: number
    comment: string
    environment: string

}