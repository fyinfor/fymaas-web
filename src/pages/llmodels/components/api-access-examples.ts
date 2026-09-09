import { modelCategoriesMap } from '../config';

export type AccessLanguage =
  | 'curl'
  | 'javascript'
  | 'go'
  | 'python'
  | 'java'
  | 'csharp';

export const ACCESS_LANGUAGES: { key: AccessLanguage; label: string }[] = [
  { key: 'curl', label: 'cURL' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'go', label: 'Go' },
  { key: 'python', label: 'Python' },
  { key: 'java', label: 'Java' },
  { key: 'csharp', label: 'C#' }
];

type ExampleInput = {
  origin: string;
  model: string;
  apiKey: string;
  category?: string;
};

const pathFor = (category?: string) => {
  switch (category) {
    case modelCategoriesMap.embedding:
      return '/v1/embeddings';
    case modelCategoriesMap.reranker:
      return '/v1/rerank';
    case modelCategoriesMap.image:
      return '/v1/images/generations';
    case modelCategoriesMap.text_to_speech:
      return '/v1/audio/speech';
    case modelCategoriesMap.speech_to_text:
      return '/v1/audio/transcriptions';
    default:
      return '/v1/chat/completions';
  }
};

const jsonBody = (model: string, category?: string) => {
  switch (category) {
    case modelCategoriesMap.embedding:
      return {
        model,
        input: 'Hello!'
      };
    case modelCategoriesMap.reranker:
      return {
        model,
        query: 'Hello!',
        documents: ['Example document']
      };
    case modelCategoriesMap.image:
      return {
        model,
        prompt: 'a cat',
        n: 1
      };
    case modelCategoriesMap.text_to_speech:
      return {
        model,
        input: 'Hello!',
        voice: 'alloy'
      };
    default:
      return {
        model,
        messages: [{ role: 'user', content: 'Hello!' }],
        stream: false
      };
  }
};

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

export const buildAccessExamples = ({
  origin,
  model,
  apiKey,
  category
}: ExampleInput): Record<AccessLanguage, string> => {
  const path = pathFor(category);
  const url = `${origin}${path}`;
  const body = jsonBody(model, category);
  const bodyText = pretty(body);
  const key = apiKey || 'YOUR_API_KEY';

  return {
    curl: `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${key}" \\
  -d '${bodyText}'`,
    javascript: `const response = await fetch("${url}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer ${key}"
  },
  body: JSON.stringify(${bodyText})
});
const data = await response.json();
console.log(data);`,
    go: `package main

import (
  "bytes"
  "fmt"
  "io"
  "net/http"
)

func main() {
  body := []byte(\`${bodyText}\`)
  req, _ := http.NewRequest(http.MethodPost, "${url}", bytes.NewReader(body))
  req.Header.Set("Content-Type", "application/json")
  req.Header.Set("Authorization", "Bearer ${key}")
  resp, err := http.DefaultClient.Do(req)
  if err != nil {
    panic(err)
  }
  defer resp.Body.Close()
  data, _ := io.ReadAll(resp.Body)
  fmt.Println(string(data))
}`,
    python:
      !category || category === modelCategoriesMap.llm
        ? `from openai import OpenAI

client = OpenAI(base_url="${origin}/v1", api_key="${key}")
response = client.chat.completions.create(
    model="${model}",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=False,
)
print(response.choices[0].message.content)`
        : category === modelCategoriesMap.embedding
          ? `from openai import OpenAI

client = OpenAI(base_url="${origin}/v1", api_key="${key}")
response = client.embeddings.create(model="${model}", input="Hello!")
print(response.data[0].embedding[:8])`
          : `import json
import requests

response = requests.post(
    "${url}",
    headers={
        "Authorization": "Bearer ${key}",
        "Content-Type": "application/json",
    },
    json=json.loads("""
${bodyText}
"""),
)
print(response.json())`,
    java: `var client = HttpClient.newHttpClient();
var request = HttpRequest.newBuilder()
    .uri(URI.create("${url}"))
    .header("Content-Type", "application/json")
    .header("Authorization", "Bearer ${key}")
    .POST(HttpRequest.BodyPublishers.ofString("""
${bodyText}
"""))
    .build();
var response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`,
    csharp: `using var client = new HttpClient();
client.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", "${key}");
var content = new StringContent("""
${bodyText}
""", Encoding.UTF8, "application/json");
var response = await client.PostAsync("${url}", content);
Console.WriteLine(await response.Content.ReadAsStringAsync());`
  };
};

export type SchemaRow = {
  name: string;
  type: string;
  example: string;
  descId: string;
};

export const schemaForCategory = (
  model: string,
  category?: string
): SchemaRow[] => {
  if (category === modelCategoriesMap.embedding) {
    return [
      {
        name: 'object',
        type: 'string',
        example: 'list',
        descId: 'models.table.apiAccessInfo.schema.object'
      },
      {
        name: 'data',
        type: 'array',
        example: '[{...}]',
        descId: 'models.table.apiAccessInfo.schema.data'
      },
      {
        name: 'model',
        type: 'string',
        example: model,
        descId: 'models.table.apiAccessInfo.schema.model'
      },
      {
        name: 'usage',
        type: 'object',
        example: '{...}',
        descId: 'models.table.apiAccessInfo.schema.usage'
      }
    ];
  }
  return [
    {
      name: 'id',
      type: 'string',
      example: 'chatcmpl-123',
      descId: 'models.table.apiAccessInfo.schema.id'
    },
    {
      name: 'object',
      type: 'string',
      example: 'chat.completion',
      descId: 'models.table.apiAccessInfo.schema.object'
    },
    {
      name: 'created',
      type: 'integer',
      example: '1677652288',
      descId: 'models.table.apiAccessInfo.schema.created'
    },
    {
      name: 'model',
      type: 'string',
      example: model,
      descId: 'models.table.apiAccessInfo.schema.model'
    },
    {
      name: 'choices',
      type: 'array',
      example: '[{...}]',
      descId: 'models.table.apiAccessInfo.schema.choices'
    },
    {
      name: 'usage',
      type: 'object',
      example: '{...}',
      descId: 'models.table.apiAccessInfo.schema.usage'
    }
  ];
};
