var i=class{constructor(t,r){this.variant=t;this.data=r}match(t){let r=t[this.variant];return r?r(this.data):t._(this.data)}if_let(t,r){return this.variant===t?(r(this.data),!0):!1}};function p(...o){return function(t){let r=class extends t{};for(let u of o)Object.defineProperty(r,u,{value(h){return new r(u,h)}});return r}}var e=class extends i{static Ok(t){return new e("Ok",t)}static Err(t){return new e("Err",t)}unwrap_or_else(t){return this.variant==="Ok"?this.data:t(this.data)}expect(t){return this.unwrap_or_else(()=>{throw new Error(t)})}unwrap(){return this.unwrap_or_else(t=>{throw t instanceof Error?t:new Error(String(t))})}unwrap_or(t){return this.variant==="Ok"?this.data:t}is_ok(){return this.variant==="Ok"}is_err(){return this.variant==="Err"}ok(){return this.variant==="Ok"?T(this.data):a}q(t){return this.variant==="Err"&&t(this),this.data}},{Ok:c,Err:M}=e,s=class extends i{static Some(t){return new s("Some",t)}unwrap_or_else(t){return this===a?t():this.data}expect(t){return this.unwrap_or_else(()=>{throw new Error(t)})}unwrap(){return this.unwrap_or_else(()=>{throw new Error("unwrapping None")})}unwrap_or(t){return this===a?t:this.data}ok_or(t){return this===a?M(t):c(this.data)}is_none(){return this===a}is_some(){return!this.is_none()}},n=s;n.None=new s("None",void 0);var{Some:T,None:a}=n;export{i as EnumBase,M as Err,a as None,c as Ok,n as Option,e as Result,T as Some,p as variants};
