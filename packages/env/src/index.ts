import type { BaseSchema, Output, SchemaIssue, SchemaIssues } from 'valibot'
import { safeParse } from 'valibot'

export function createEnv<TSchema extends BaseSchema>(args: {
	schema: TSchema
	runtimeEnv?: unknown
}) {
	const Schema = args.schema
	type Schema = Output<typeof Schema>
	let env: Schema | undefined

	return {
		getEnv() {
			if (env != null) return env

			const parsing = safeParse(Schema, args.runtimeEnv ?? process.env)
			if (!parsing.success) throw new MissingEnvError(parsing.issues)

			env = parsing.output
			return parsing.output
		},
	}
}

class MissingEnvError extends Error {
	constructor(issues: SchemaIssues) {
		const msg = issues.reduce(reduceIssueMessage, '')
		super(`Missing environment variables\n${msg}`)
	}
}

function reduceIssueMessage(msg: string, issue: SchemaIssue) {
	let _msg = msg
	if (issue.issues) {
		_msg += issue.issues.reduce(reduceIssueMessage, _msg)
	}

	if (issue.path) {
		for (const pathItem of issue.path) {
			_msg += `\n${pathItem.key}`
		}
	}

	return _msg
}
