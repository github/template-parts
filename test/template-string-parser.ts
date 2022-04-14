import {expect, chai} from '@open-wc/testing'
import {Token, parse} from '../src/template-string-parser'
chai.config.truncateThreshold = Infinity

function parserTest(message: string, ...tests: Array<string | Token[]>) {
  describe(message, () => {
    for (let i = 0; i < tests.length; i += 2) {
      it(String(tests[i]), () => {
        const output = parse(String(tests[i]))
        let n = 0
        for (const token of output) {
          expect(token)
            .to.have.property('type')
            .match(/^(part|string)$/)
          expect(token).to.have.property('start', n)
          expect(token).to.have.property('end').gte(n)
          n = token.end
        }
        expect(output).to.eql(tests[i + 1])
      })
    }
  })
}

describe.only('template-string-parser', () => {
  parserTest('extracts `{{}}` surrounding parts as part tokens', '{{x}}', [
    {type: 'part', start: 0, end: 5, value: 'x'}
  ])

  parserTest('tokenizes a template string successfully', 'hello {{x}}', [
    {type: 'string', start: 0, end: 6, value: 'hello '},
    {type: 'part', start: 6, end: 11, value: 'x'}
  ])

  parserTest(
    'tokenizes multiple values',
    'hello {{x}} and {{y}}',
    [
      {type: 'string', start: 0, end: 6, value: 'hello '},
      {type: 'part', start: 6, end: 11, value: 'x'},
      {type: 'string', start: 11, end: 16, value: ' and '},
      {type: 'part', start: 16, end: 21, value: 'y'}
    ],
    'hello {{x}} and {{y}}!',
    [
      {type: 'string', start: 0, end: 6, value: 'hello '},
      {type: 'part', start: 6, end: 11, value: 'x'},
      {type: 'string', start: 11, end: 16, value: ' and '},
      {type: 'part', start: 16, end: 21, value: 'y'},
      {type: 'string', start: 21, end: 22, value: '!'}
    ]
  )

  parserTest(
    'tokenizes consecutive values',
    'hello {{x}}{{y}}',
    [
      {type: 'string', start: 0, end: 6, value: 'hello '},
      {type: 'part', start: 6, end: 11, value: 'x'},
      {type: 'part', start: 11, end: 16, value: 'y'}
    ],
    '{{x}}{{y}}{{z}}',
    [
      {type: 'part', start: 0, end: 5, value: 'x'},
      {type: 'part', start: 5, end: 10, value: 'y'},
      {type: 'part', start: 10, end: 15, value: 'z'}
    ],
    'abc{{def}}{{ghi}}{{jkl}}{{mno}}{{pqr}}{{stu}}vwxyz',
    [
      {type: 'string', start: 0, end: 3, value: 'abc'},
      {type: 'part', start: 3, end: 10, value: 'def'},
      {type: 'part', start: 10, end: 17, value: 'ghi'},
      {type: 'part', start: 17, end: 24, value: 'jkl'},
      {type: 'part', start: 24, end: 31, value: 'mno'},
      {type: 'part', start: 31, end: 38, value: 'pqr'},
      {type: 'part', start: 38, end: 45, value: 'stu'},
      {type: 'string', start: 45, end: 50, value: 'vwxyz'}
    ]
  )

  parserTest('does not turn escaped `{{`s into expression tokens', '\\{{x}}', [
    {type: 'string', start: 0, end: 6, value: '\\{{x}}'}
  ])

  parserTest('strips leading and trailing whitespace', '{{ x }}', [{type: 'part', start: 0, end: 7, value: 'x'}])

  parserTest(
    'correctly deals with trailing strings',
    '{{ x }}!',
    [
      {type: 'part', start: 0, end: 7, value: 'x'},
      {type: 'string', start: 7, end: 8, value: '!'}
    ],
    'hello {{x}}!',
    [
      {type: 'string', start: 0, end: 6, value: 'hello '},
      {type: 'part', start: 6, end: 11, value: 'x'},
      {type: 'string', start: 11, end: 12, value: '!'}
    ]
  )

  parserTest(
    'does not terminate expressions with escaped `}}`s',
    '{{x\\}}}',
    [{type: 'part', start: 0, end: 7, value: 'x\\}'}],
    '{{x\\}\\}}}',
    [{type: 'part', start: 0, end: 9, value: 'x\\}\\}'}],
    '{{x\\}}',
    [{type: 'string', start: 0, end: 6, value: '{{x\\}}'}],
    '\\{{x}}',
    [{type: 'string', start: 0, end: 6, value: '\\{{x}}'}]
  )

  parserTest('ignores single braces', 'hello ${world?}', [
    {type: 'string', start: 0, end: 15, value: 'hello ${world?}'}
  ])

  parserTest(
    'ignores mismatching parens, treating them as text',
    'hello }}',
    [{type: 'string', start: 0, end: 8, value: 'hello }}'}],
    'hello {{',
    [{type: 'string', start: 0, end: 8, value: 'hello {{'}],
    'hello {{{{',
    [{type: 'string', start: 0, end: 10, value: 'hello {{{{'}],
    'hello {{}{',
    [{type: 'string', start: 0, end: 10, value: 'hello {{}{'}],
    'hello }}{{}',
    [{type: 'string', start: 0, end: 11, value: 'hello }}{{}'}]
  )

  parserTest('ignores nested parens, treating them as text', '{{ "Your balance: {{ balance }}" }}', [
    {type: 'part', start: 0, end: 35, value: '"Your balance: {{ balance }}"'}
  ])

  parserTest(
    'parses awkward inputs correctly',
    '{x{{}}}',
    [
      {type: 'string', start: 0, end: 2, value: '{x'},
      {type: 'part', start: 2, end: 6, value: ''},
      {type: 'string', start: 6, end: 7, value: '}'}
    ],
    '{{{x}}}',
    [
      {type: 'part', start: 0, end: 6, value: '{x'},
      {type: 'string', start: 6, end: 7, value: '}'}
    ],
    '{}{{x}}}',
    [
      {type: 'string', start: 0, end: 2, value: '{}'},
      {type: 'part', start: 2, end: 7, value: 'x'},
      {type: 'string', start: 7, end: 8, value: '}'}
    ]
  )
})
