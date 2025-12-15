import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { Spend, SpendResponse } from "../models/spend"
import { DynamoDbRepoSpend } from "../repositories/dynamoDbRepoSpend"
import { SpendService } from "../services/spendService"

export async function spendHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        try {
        const body = event.body ? JSON.parse(event.body) : {}
        const repo = new DynamoDbRepoSpend()
        const service = new SpendService(repo)

        const spendCreated: Spend = await service.createSpend(
            body.name,
            body.description,
            Number(body.amount)
        )

        return {
            statusCode: 200,
            headers: { 
                "Access-Control-Allow-Origin": "*",
                 "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                 "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                message: "Spend created successfully",
                spend_created: spendCreated.asDict(),
            }),
        }
    } catch (error) {
        console.error("Error creating spend:", error)
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Internal server error" }),
        }
    }
}

export async function getSpendHandler(event: any): Promise<APIGatewayProxyResult> {
    try {
        const customHeaderAuth = event.headers["Authorization"] || "";
          console.log("customHeaderAuth ", customHeaderAuth);
        
        if (!customHeaderAuth.startsWith("Basic ")) {
            return {
                statusCode: 401,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Unauthorized" }),
            }
        }
        const encodedCredentials = customHeaderAuth.split(" ")[1] || "";
        console.log("Authorization Header:1 ", encodedCredentials);
        const decodedCredentials = Buffer.from(encodedCredentials, "base64").toString("utf-8")
        const [username, password] = decodedCredentials.split(":")
console.log("Authorization Header:2 ", username);
console.log("Authorization Header:3 ", password);
        const expectedUsername = process.env.SSM_USERNAME || ""
        const expectedPassword = process.env.SSM_PASSWORD || ""
        console.log("Expected Username: ", expectedUsername);
        console.log("Expected Password: ", expectedPassword);

        if (username !== expectedUsername || password !== expectedPassword) {
            return {
                statusCode: 401,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Unauthorized" }),
            }
        }

        const repo = new DynamoDbRepoSpend()
        const service = new SpendService(repo)

        const spends = await service.getSpends()

        return {
            statusCode: 200,
            headers: { 
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            body: JSON.stringify({ spends }),
        }
    } catch (error) {
        console.error("Error fetching spends:", error)
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Internal server error" }),
        }
    }
}
