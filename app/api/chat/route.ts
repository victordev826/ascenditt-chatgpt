import { NextResponse } from 'next/server';
import { GoogleAdsApi } from 'google-ads-api';
import OpenAI from 'openai';
import path from 'path';
import { config } from 'dotenv';
import vm from 'vm';

// Load environment variables from .env file
config({ path: path.join(process.cwd(), '.env') });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize Google Ads API
const client = new GoogleAdsApi({
  client_id: process.env.CLIENT_ID!,
  client_secret: process.env.CLIENT_SECRET!,
  developer_token: process.env.DEVELOPER_TOKEN!,
});

const customer = client.Customer({
  customer_id: process.env.CUSTOMER_ID!,
  refresh_token: process.env.REFRESH_TOKEN!,
  login_customer_id: process.env.LOGIN_CUSTOMER_ID!,
});

console.log("Customer ID:", process.env.CUSTOMER_ID);

// Function to generate and execute the OpenAI function
async function generateAndExecuteFunction(prompt: string, retryCount = 0) {
  console.log("Prompt:", prompt);
  try {
    // Get function from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user", content: `${prompt}

            I already created client and customer with google-ads-api npm package. Like that. 
            const client = new GoogleAdsApi({
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              developer_token: DEVELOPER_TOKEN,
            });

            const customer = client.Customer({
              customer_id: CUSTOMER_ID,
              refresh_token: REFRESH_TOKEN,
              login_customer_id: LOGIN_CUSTOMER_ID,
            });
            
            Solve the problems with customer.report function.

            Make the javascript function with no errors and it must return the asked data.
            And in the catch part, return the error message.

            Not need explanation and other things.
            Function name is func
            Parameters: client, customer
            
            ` }],
    });

    // Extract function code from response
    const response = completion.choices[0].message.content!;
    console.log("Response:", response);
    const functionCode = extractFunctionCode(response);

    console.log("Function code:", functionCode);

    if (!functionCode) {
      throw new Error("No function code found in the response");
    }

    // Execute the generated function
    const result = await executeGeneratedFunction(functionCode);
    if (!result) {
      throw new Error("No result found after executing the function");
    }
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }

    // Only retry up to 10 times
    if (retryCount < 10) {
      console.log(`Retrying... Attempt ${retryCount + 1}`);
      return generateAndExecuteFunction(
        `${prompt}\n\nThe previous attempt failed with error: ${error instanceof Error ? error.message : 'Unknown error'}. Please fix the code and try again.`,
        retryCount + 1
      );
    }

    throw error;
  }
}

// Extract function code from OpenAI response
function extractFunctionCode(response: string) {
  const regex =
    /```(?:javascript|js|JavaScript)?\s*(async function func[\s\S]*?)\s*```/;
  const match = response.match(regex);
  return match ? match[1] : null;
}

interface ResultType {
  result: string | Array<object> | object | number | boolean | null;
}

async function getDetailedResponseFromResult(question: string, result: ResultType) {
  const prompt = `Question: ${question}
  
  Answer: ${JSON.stringify(result)}
  
  Show answers that users can easily see and understand.`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user", content: `${prompt}`
    }]
  });
  return completion.choices[0].message.content!;
}

// Execute the generated function
async function executeGeneratedFunction(functionCode: string) {
  const context = {
    require: require,
    process: process,
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    client: client,
    customer: customer,
    exports: {},
    module: { exports: {} },
  };

  const script = new vm.Script(`
    ${functionCode}
    if (typeof func === 'undefined') {
      throw new Error('Function "func" was not defined in the code');
    }
    module.exports = func;
  `);

  const vmContext = vm.createContext(context);
  script.runInContext(vmContext);

  const func = context.module.exports;
  if (typeof func !== "function") {
    throw new Error("Exported value is not a function");
  }

  console.log("Function successfully loaded");

  try {
    const data = await func(client, customer);
    console.log("data", data);

    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error; // Let the parent function handle the retry
  }
}

export const POST = async (request: Request,) => {
  const { messages } = await request.json();
  const prompt = messages[messages.length - 1]['content'][0]['text'];
  let result = await generateAndExecuteFunction(prompt);

  if (!result) result = "Provide more details question.";

  result = await getDetailedResponseFromResult(prompt, result);
  return NextResponse.json(result);
}