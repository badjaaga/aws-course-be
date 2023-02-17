import {
	APIGatewayEvent, APIGatewayProxyResult,
	Context
} from "aws-lambda";
import * as handler from "../handler";
import {Callback} from "aws-lambda/handler";

test("getProductById", async () => {
	const event = {pathParameters: {productId: '1'}} as unknown as APIGatewayEvent;
	const context = {} as Context;
	const callback: Callback = null;

	const response: void | APIGatewayProxyResult = await handler.getProductById(event, context, callback);

	if (response && response.statusCode === 200) {
		expect(JSON.parse(response.body).product?.id).toEqual(event.pathParameters.productId);
	} else if (response && response.statusCode === 404) {
		expect(JSON.parse(response.body).message).toEqual('Product not found')
	}

});

test("getAllProducts", async () => {
	const event = {} as unknown as APIGatewayEvent;
	const context = {} as Context;
	const callback: Callback = null;
	const response: void | APIGatewayProxyResult = await handler.getAllProducts(event, context, callback);

	if (response) {
		expect(response.statusCode).toBe(200);
		expect(typeof response.body).toBe("string")
	}
})
