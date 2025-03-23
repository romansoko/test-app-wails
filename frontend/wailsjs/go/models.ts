export namespace main {
	
	export class OrderItem {
	    productId: string;
	    productName: string;
	    price: number;
	    quantity: number;
	
	    static createFrom(source: any = {}) {
	        return new OrderItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.productId = source["productId"];
	        this.productName = source["productName"];
	        this.price = source["price"];
	        this.quantity = source["quantity"];
	    }
	}
	export class Order {
	    id: string;
	    date: string;
	    name: string;
	    description: string;
	    items: OrderItem[];
	    total: number;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new Order(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.date = source["date"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.items = this.convertValues(source["items"], OrderItem);
	        this.total = source["total"];
	        this.status = source["status"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Product {
	    id: string;
	    name: string;
	    price: number;
	    description: string;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new Product(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.price = source["price"];
	        this.description = source["description"];
	        this.status = source["status"];
	    }
	}
	export class StockItem {
	    id: string;
	    name: string;
	    description: string;
	    quantity: number;
	
	    static createFrom(source: any = {}) {
	        return new StockItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.quantity = source["quantity"];
	    }
	}

}

