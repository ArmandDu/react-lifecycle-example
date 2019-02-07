import React, { Component } from "react";
import * as Promise from "bluebird";
import isEqual from "lodash/isEqual";

Promise.config({
	cancellation: true,
});

/**
 * Utility function to fetch and parse JSON responses.
 * @param {string} url location of resource
 * @param {object} data fetch configuration data
 */
function fetchJSON(url, data) {
	return fetch(url).then(res => {
		if (!res.ok) {
			const error = new Error();
			error.response = res;
			return Promise.reject(error);
		}

		return res.json();
	});
}

export default class TodoApp extends Component {
	constructor(props) {
		super(props);

		//don't call fetch in the constructor but define the default state here.
		this.state = {
			todos: [],
		};

		//Example, how to use bluedird to cancel the fetch
		//Create a dummy Promise to avoid null checks
		this.fetchPromise = Promise.resolve();
	}

	componentDidMount() {
		/**
		 * componentDidMount is the correct place to subscribe to events or data. Correct usage include:
		 *
		 * this.intervalId = setInterval(function(){}, interval)
		 * this.mount.current.addEventListener(this.handleMyEvent)
		 */

		this.fetchPromise = fetchJSON("todos.json").then(todos => {
			this.setState({ todos });
		});
	}

	componentWillUnmount() {
		/**
		 * componentWillUnmount is here to cancel or clean your manually allocated resources. Examples:
		 *
		 * clearInterval(this.intervalId)
		 * this.mount.current.removeEventListener(this.handleMyEvent)
		 */
		this.fetchPromise.cancel();
	}

	handleClick = id => {
		this.setState(prevState => ({
			todos: prevState.todos.map(todo => {
				return {
					...todo,
					checked: id === todo.id ? !todo.checked : todo.checked,
				};
			}),
		}));
	};

	render() {
		return (
			<div id="App">
				<TodoList todos={this.state.todos} onChange={this.handleClick} />
			</div>
		);
	}
}

class TodoList extends Component {
	state = {
		featured: 0,
	};

	componentDidMount() {
		//pick one random todo as a feature.
		//issue, on componentDidMount, the todos array will be empty.
		//To get a random index when the array is populated, we need another method: componentDidUpdate
		this.setState({
			featured: Math.floor(Math.random() * this.props.todos.length),
		});
	}

	componentDidUpdate(prevProps, prevState) {
		/**
		 * componentDidUpdate is a method that will be executed each time the component updates.
		 * An update happens when the props or state has changed ans componentShouldUpdate returns true. (see doc for further info)
		 *
		 * In this component, we update our manually allocated data when they depend on previous props or previous state.
		 *
		 *  Here, we will check that the todos has changed. if it has, we update our "featured" state.
		 */

		const prevTodosIds = prevProps.todos.map(todo => todo.id);
		const currentTodosId = this.props.todos.map(todo => todo.id);

		//we check that the previous todos and current todos are the same. If not we update our featured info.
		if (!isEqual(prevTodosIds, currentTodosId)) {
			this.setState({
				featured: Math.floor(Math.random() * this.props.todos.length),
			});
		}
	}

	render() {
		const { featured } = this.state;
		const { onChange, todos } = this.props;
		const featuredTodo = todos[featured];

		return (
			<div>
				<h2>Featured Todo</h2>
				{featuredTodo && <Todo todo={featuredTodo} onChange={onChange} />}

				<h2>All Todos</h2>
				<ul>
					{this.props.todos.map(todo => (
						<li key={todo.id}>
							<Todo todo={todo} onChange={onChange} />
						</li>
					))}
				</ul>
			</div>
		);
	}
}

/**
 * Functionnal component, it's the second form a component can take.
 */
function Todo({ todo, onChange }) {
	return (
		<h4>
			{todo.value}{" "}
			<input type="checkbox" checked={todo.checked} onChange={() => onChange(todo.id)} />
		</h4>
	);
}
