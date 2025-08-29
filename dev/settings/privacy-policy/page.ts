import { m } from "@mufw/maya";
import { GoBackButton, HTMLPage } from "../../@components";
import { Scaffold } from "../../@elements";
import { PRIVACY_POLICY } from "./@lib/constants";

export default HTMLPage({
  cssClasses: "bg-white ph3",
  body: Scaffold({
    cssClasses: "bg-white",
    header: "Privacy Policy",
    content: m.Div({
      class: "gray pt3",
      children: [
        m.Div([
          m.Span({
            class: "b dark-gray",
            children: "Effective date: ",
          }),
          PRIVACY_POLICY.date.toDateString(),
        ]),
        m.Div(
          m.For({
            subject: PRIVACY_POLICY.policies,
            n: 0,
            nthChild: m.Div({
              class: "mv3",
              children: PRIVACY_POLICY.description,
            }),
            map: (policy, i) =>
              m.Div({
                class: "mv4",
                children: [
                  m.Div({
                    class: "b f4 mid-gray mb2",
                    children: `${i + 1}. ${policy.title}`,
                  }),
                  policy.description,
                  m.If({
                    subject: policy.bullets.length,
                    isTruthy: () =>
                      m.Ul(
                        m.For({
                          subject: policy.bullets,
                          map: (bulletPoint) => m.Li(bulletPoint),
                        })
                      ),
                  }),
                ],
              }),
          })
        ),
      ],
    }),
    bottombar: m.Div({
      class: "pb3",
      children: GoBackButton({}),
    }),
  }),
});
