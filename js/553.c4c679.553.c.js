(self.webpackChunk=self.webpackChunk||[]).push([[553],{yyI4d:function(e){e.exports='<p>As we all know, React Router is almost the official routing library in React and hardly anyone knows of any alternatives. While building some screens using a <a href="https://en.wikipedia.org/wiki/Query_string"><code>Query string</code></a> I ran into some problems, mainly how to get my object given a query string.</p> <h2 id="determination-of-volume">Determination of volume</h2> <p>I had issues with the query string, but for the client-side router I needed something that would manage the URL path, manage history, and render my components according to the URL path (getting ids or parameters that make up the route) ... We will need soon:</p> <ul> <li>Parameter control</li> <li>Rendering the path</li> <li>Query string control</li> <li>Access to history</li> <li>Browser navigation control</li> </ul> <p>Now that we have what we need to do, let\'s see what we want to have as the final code.</p> <pre><code class="language-js">const history = History();\r\nconst App = () => (\r\n    &#x3C;Router history={history}>\r\n        &#x3C;Route path="/" component={Root} />\r\n        &#x3C;Route path="/orders/:id" component={ViewOrders} />\r\n        &#x3C;Route path="/orders/:id/:operation" component={CrudOrders} />\r\n    &#x3C;/Router>\r\n);\n</code></pre> <p>The router is usually at the top level of our application, covering all the components, so we can create <code>&#x3C;Route /></code> different ones. It is the <code>&#x3C;Router /></code> who provides the context for our routes and is responsible for managing the rendering of each route.</p> <p>To create a router, we have to follow these steps:</p> <ul> <li>Create context a <a href="https://github.com/ReactTraining/history"><code>history</code></a>.</li> <li>Control all paths with received routes.</li> <li>Register the routes according to the rendering of the child routers.</li> </ul> <p>The history package was used to ensure consistency across browsers. For our context, we have:</p> <pre><code class="language-js">import { createBrowserHistory } from "history";\r\nimport { createContext } from "react";\r\n\r\nexport const History = createBrowserHistory();\r\nexport const HistoryContext = createContext({ ...History, params: {} });\n</code></pre> <p>Thanks to this, we can create our <code>&#x3C;Router /></code> component that will provide our context for each element displayed on the screen.</p> <pre><code class="language-js">import { pathToRegexp } from "path-to-regexp";\r\n\r\n// Defining types so we can work\r\ninterface MatchRoute {\r\n    regex: RegExp;\r\n    path: string;\r\n    component: FC;\r\n    params: Array&#x3C;{\r\n        name: string;\r\n        prefix: string;\r\n        suffix: string;\r\n        pattern: string;\r\n        modifier: string;\r\n    }>;\r\n}\r\n\r\ninterface RouterProps {\r\n    notFound: FC;\r\n}\r\n\r\ninterface Render {\r\n    Component: FC&#x3C;any>;\r\n    params: { [k: string]: any };\r\n}\r\n\r\nexport const Router: FC&#x3C;RouterProps> = ({ children, notFound: NotFound }) => {\r\n    const [location, setLocation] = useState(() => History.location);\r\n    const [pathname, setPathName] = useState(History.location.pathname);\r\n\r\n    /*\r\n        This is the callback that builds our state, taking children\r\n        and assembling the routes based on the "path" of each &#x3C;Route />\r\n    */\r\n    const init = useCallback(() => {\r\n        /*\r\n            Using Children.toArray, we take all the children of our &#x3C;Router /> \r\n            .sort (), which we do so that routes without parameters are prioritized \r\n            so as not to break the path regex.\r\n        */\r\n        const routes = Children.toArray(children).sort((a: any, b: any) => {\r\n            const x: RouteProps = a.props;\r\n            const y: RouteProps = b.props;\r\n            const xHas = x.path.includes(":");\r\n            const yHas = y.path.includes(":");\r\n\r\n            if (!xHas || x.path === "/") return -1;\r\n            if (yHas) return 1;\r\n            return 0;\r\n        });\r\n\r\n        \r\n        // With this map, we create each regex for the paths \r\n        // specified in the route components\r\n        const rules = routes.map((x: any) => {\r\n            const params: any[] = [];\r\n            const regex = pathToRegexp(x.props.path, params);\r\n            return { ...x.props, regex, params };\r\n        });\r\n\r\n        return { routes, rules };\r\n    }, [children]);\r\n\r\n    // Status initialization via function\r\n    const controller = useMemo&#x3C;{\r\n        rules: MatchRoute[];\r\n        routes: any[];\r\n    }>(init, [init]);\r\n\r\n    useEffect(() => {\r\n        History.listen((e) => {\r\n            setLocation(e.location);\r\n            setPathName(e.location.pathname);\r\n        });\r\n    }, []);\r\n\r\n    // A memo that will take care of rendering and obtaining the `params` \r\n    // given our current path In it we will make the route comparisons and \r\n    // define whether such a route exists or not\r\n    const render = useMemo((): Render => {\r\n        const params: any = {};\r\n        // Early return to the root\r\n        if (pathname === "/") {\r\n            const current = controller.routes.find((x) => x.props.path === "/");\r\n            if (current) {\r\n                return {\r\n                    Component: current.props.component,\r\n                    params\r\n                };\r\n            }\r\n            // Route / has not been registered and will be redirected to NotFound\r\n            return { Component: NotFound, params };\r\n        }\r\n\r\n        const index = controller.rules.findIndex((x) => {\r\n            const exec = x.regex.exec(pathName);\r\n            // If the regex of the current route does not match, return false\r\n            if (exec === null) return false;\r\n            // Regex group object returned, we can capture the values \r\n            // in an array using the destruction, taking from item 1 onwards.\r\n            const [, ...groups] = exec;\r\n            // Assigning values to params\r\n            groups.forEach((val, i) => {\r\n                const regex = x.params[i].name;\r\n                // a light theft to parse the values safely\r\n                try {\r\n                    params[regex] = JSON.parse(val);\r\n                } catch (error) {\r\n                    params[regex] = val;\r\n                }\r\n            });\r\n            return true;\r\n        });\r\n        const current = controller.routes[index];\r\n        // If my current is undefined, the route does not exist \r\n        // and is redirected to NotFound\r\n        if (current === undefined) {\r\n            return { Component: NotFound, params };\r\n        }\r\n\r\n        return { Component: current.props.component, params };\r\n    }, [controller, NotFound, pathName]);\r\n\r\n    // history props\r\n    const historyComponent = useMemo(() => ({ ...History, location }), [\r\n        location,\r\n    ]);\r\n\r\n    // Our context delivered and the router rendering only our target path component\r\n    return (\r\n        &#x3C;HistoryContext.Provider value={{ ...History, params: render.params }}>\r\n            &#x3C;render.Component history={historyComponent} />\r\n        &#x3C;/HistoryContext.Provider>\r\n    );\r\n};\n</code></pre> <p>And with that we have a router, but we are still missing a way to create our <code>&#x3C;Route /></code></p> <pre><code class="language-js">type RouteProps {\r\n    path: string;\r\n    component: FC;\r\n}\r\n\r\nexport const Route = (props: RouteProps) => {\r\n    const router = useContext(HistoryContext);\r\n    // any is so that we can ignore and inject history props into our components\r\n    return &#x3C;props.component {...(router as any)} />\r\n};\n</code></pre> <p>But there was also no way to create links to navigate between pages. To do this, we can create a component that uses the <code>&#x3C;a/></code> href attribute itself, so that we have an accessible and semantic way to create our links.</p> <pre><code class="language-js">export const Link: React.FC&#x3C;A> = ({ onClick, state, href, ...props }) => {\r\n    // the click callback that prevents the default of the element\r\n    const click = useCallback(\r\n        (e: React.MouseEvent&#x3C;HTMLAnchorElement, MouseEvent>) => {\r\n            onClick?.(e);\r\n            if (!href.startsWith("http")) {\r\n                e.preventDefault();\r\n                return History.push(href, state);\r\n            }\r\n        },\r\n        [onClick, href, state]\r\n    );\r\n    return &#x3C;a {...props} href={href} onClick={click} />\r\n};\n</code></pre> <p>And with that, we have all the necessary elements for the base of the router.</p> '}}]);