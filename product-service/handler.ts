import {APIGatewayProxyHandler} from "aws-lambda";
import {PRODUCTS_MOCK} from "./mocks/products";
import {Product} from "./entities/product";

export const getProductById: APIGatewayProxyHandler = async (event, context, _callback) => {
	const {pathParameters} = event;
	const productId = pathParameters?.productId;
	const product = PRODUCTS_MOCK.find((item: Product) => item.id === productId);

	if (product) {
		return {
			statusCode: 200,
			body: JSON.stringify({
				product,
			}),
		};
	} else {
		return {
			statusCode: 404, body: JSON.stringify({
				message: "Product not found"
			}),
		}
	}
};

export const getAllProducts: APIGatewayProxyHandler = async (event, context, _callback) => {
	return {
		statusCode: 200,
		body: JSON.stringify(
			PRODUCTS_MOCK
	),
	};
};
