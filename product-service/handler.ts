import {APIGatewayProxyHandler} from "aws-lambda";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {
	DynamoDBDocumentClient,
	GetCommand, PutCommand, ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import {v4 as uuidv4} from 'uuid';

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

export const getProductById: APIGatewayProxyHandler = async (event) => {
	const {pathParameters} = event;
	const productId = pathParameters?.productId;

	const productsTableParams = {
		TableName: "car-shop-products",
		Key: {
			id: productId
		}
	};

	const stocksTableParams = {
		TableName: "car-shop-stocks",
		Key: {
			"product_id": productId
		}
	};

	let body;
	let statusCode;
	const headers = {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*", // Required for CORS support to work
		"Access-Control-Allow-Credentials": true
	}

	try {
		statusCode = 200;
		const productsData = await dynamo.send(new GetCommand(productsTableParams)).then();
		const stocksData = await dynamo.send(new GetCommand(stocksTableParams)).then();

		const filtered = await Promise.all([productsData, stocksData]).then(values => {
			return {...values[0].Item, count: values[1].Item.count}
		});

		body = JSON.stringify(filtered);
	} catch (err) {
		body = `Unable to get Products: ${err}`;
		statusCode = 403;
	}

	return {
		statusCode,
		headers,
		body
	};
};

export const getAllProducts: APIGatewayProxyHandler = async () => {
	const productsTableParams = {
		TableName: "car-shop-products",
	};

	const stocksTableParams = {
		TableName: "car-shop-stocks",
	};

	let body;
	let statusCode;
	const headers = {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*", // Required for CORS support to work
		"Access-Control-Allow-Credentials": true
	}

	try {
		statusCode = 200;
		const productsData = await dynamo.send(new ScanCommand(productsTableParams));
		const stocksData = await dynamo.send(new ScanCommand(stocksTableParams));

		console.log(productsData, stocksData);

		const filtered = await Promise.all([productsData, stocksData]).then(values => {
			return values[0].Items.map(product => {
				return {...product, count: values[1].Items.find(item => item.product_id === product.id).count}
			})
		});

		body = JSON.stringify(filtered);

	} catch (err) {
		body = `Unable to get Products: ${err}`;
		statusCode = 403;
	}

	return {
		statusCode,
		headers,
		body
	};
};

export const createProduct: APIGatewayProxyHandler = async (event) => {
	const data = JSON.parse(event.body);

	const id = uuidv4();

	console.log('invoked', id);

	const productsTableParams = {
		TableName: "car-shop-products",
		Item: {
			id: id,
			title: data.title,
			description: data.description,
			price: data.price
		}
	};

	const stocksTableParams = {
		TableName: "car-shop-stocks",
		Item: {
			product_id: id,
			count: data.count,
		}
	};

	let body;
	let statusCode;
	const headers = {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*", // Required for CORS support to work
		"Access-Control-Allow-Credentials": true
	}

	try {
		statusCode = 200;
		await dynamo.send(new PutCommand(productsTableParams));
		await dynamo.send(new PutCommand(stocksTableParams));

		body = JSON.stringify({id, message: 'product created successfully'});

	} catch (err) {
		body = `Unable to create product: ${err}`;
		statusCode = 403;
	}

	return {
		statusCode,
		headers,
		body
	};
}
