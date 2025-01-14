"""TO-DO: Write a description of what this XBlock is."""

import pkg_resources
from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import Integer, Scope, String
import logging
from xblockutils.resources import ResourceLoader

logger = logging.getLogger(__name__)
loader = ResourceLoader(__name__)

@XBlock.needs('user')
class AIExamXBlock(XBlock):

    url = String(
        display_name="PDF URL",
        default="http://tutorial.math.lamar.edu/pdf/Trig_Cheat_Sheet.pdf",
        scope= Scope.content,
        help="The URL for your PDF."
    )

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    # TO-DO: change this view to display your data your own way.
    def student_view(self, context=None):
        """
        The primary view of the AIExamXBlock, shown to students
        when viewing courses.
        """
        frag = Fragment()

        frag.add_css(self.resource_string("static/css/ai_exam.css"))
        frag.add_javascript(self.resource_string("static/js/src/ai_exam.js"))
        frag.initialize_js('AIExamXBlock')

        frag.add_content(loader.render_django_template('static/html/ai_exam.html', context=context))
        return frag
    

    @XBlock.json_handler
    def get_user_info(self, request, suffix=''):
        try:
            user =  self.runtime.service(self,'user')._django_user
        except Exception:
            # Handle the case where the user object does not exist
            logger.error("[Quiz Navigation] Error when get user info: User object not found")
        return {"user_info": { "id": user.id, "username": user.username, "email": user.email, "user_is_staff": user.user_is_staff}}
    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("AIExamXBlock",
             """<ai_exam/>
             """),
            ("Multiple AIExamXBlock",
             """<vertical_demo>
                <ai_exam/>
                <ai_exam/>
                <ai_exam/>
                </vertical_demo>
             """),
        ]
