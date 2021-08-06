import axios from "axios";
import {parseJson} from "./json";

axios.defaults.transformResponse = [parseJson];